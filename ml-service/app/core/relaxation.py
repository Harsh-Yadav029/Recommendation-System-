from typing import Callable, List, Tuple
from app.models.schemas import Constraints, RecommendationResponse

def relax_constraints_and_retry(
    fetch_func: Callable[[Constraints], RecommendationResponse],
    original_constraints: Constraints,
    target_count: int = 10
) -> RecommendationResponse:
    """
    Attempts to fetch recommendations. If results < target_count, systematically 
    relaxes constraints (order: category > budget_max > tags) and retries.
    
    Args:
        fetch_func: A closure/callback that takes a Constraints object and 
                    returns a RecommendationResponse.
        original_constraints: The user's requested constraints.
        target_count: The minimum number of results desired.
        
    Returns:
        RecommendationResponse containing the items and flags indicating if 
        relaxation occurred. If fully exhausted, returns the closest available 
        items (unconstrained) and flags it.
    """
    # 1. Try exact constraints
    response = fetch_func(original_constraints)
    if len(response.items) >= target_count:
        return response
        
    # Sequence of constraints to relax, from least to most important
    # The requirement specifies relaxing least-important constraint first:
    # "ranking: category > budget-hard-cap > secondary filters"
    # Actually, SKILL.md says: category > budget-hard-cap > secondary filters (meaning category is most important?)
    # "relax the least-important constraint (documented ranking: category > budget-hard-cap > secondary filters) and retry"
    # This implies tags/secondary filters are least important and should be relaxed first?
    # Let's relax in this order: tags -> budget_max -> category
    
    current_constraints = original_constraints.model_copy()
    
    if current_constraints.tags and len(current_constraints.tags) > 0:
        current_constraints.tags = []
        response = fetch_func(current_constraints)
        if len(response.items) >= target_count:
            response.relaxed = True
            response.relaxed_constraint = "tags"
            for item in response.items:
                item.similarity_basis = "relaxed: true, dropped tags"
            return response
            
    if current_constraints.budget_max is not None:
        current_constraints.budget_max = None
        response = fetch_func(current_constraints)
        if len(response.items) >= target_count:
            response.relaxed = True
            response.relaxed_constraint = "budget_max"
            for item in response.items:
                item.similarity_basis = "relaxed: true, dropped budget_max"
            return response
            
    if current_constraints.category is not None:
        current_constraints.category = None
        response = fetch_func(current_constraints)
        if len(response.items) >= target_count:
            response.relaxed = True
            response.relaxed_constraint = "category"
            for item in response.items:
                item.similarity_basis = "relaxed: true, dropped category"
            return response
            
    # If still empty/insufficient after all relaxations, return closest available (unconstrained)
    unconstrained = Constraints()
    response = fetch_func(unconstrained)
    
    response.relaxed = True
    response.relaxed_constraint = "all_exhausted"
    
    # Tag similarity basis for unconstrained items as requested
    for item in response.items:
        item.similarity_basis = "no exact matches, showing closest available"
        
    return response

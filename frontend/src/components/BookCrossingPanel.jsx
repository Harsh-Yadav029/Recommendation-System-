import { useNavigate } from 'react-router-dom';

export default function BookCrossingPanel({ item, expanded = true }) {
  const navigate = useNavigate();

  const getImageUrl = () => item.metadata?.Image-URL-L || item.metadata?.Image-URL-M;
  const getCoverUrl = () => getImageUrl();

  return (
    <div
      className="flex relative p-6 w-full"
      style={{ transform: expanded ? 'scale(1.02)' : 'none' }}
    >
      <div className="max-w-4xl rounded-lg overflow-hidden max-w-sm fitted">
        <div className="aspect-[1/1] overflow-hidden rounded-lg shadow-md mb-4">
          {getCoverUrl() ? (
            <img
              className="absolute w-full h-full inset-0 object-cover rounded-lg block transition-transform duration-300"
              src={getCoverUrl()}
              alt="BookCover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex';
              }}
            />
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 p-4 text-center">
              <span className="text-xs font-medium uppercase tracking-wider">No cover available</span>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900 leading-tight">
            {item.title || `Book #${item.item_id}`}
          </h2>
          <div className="flex flex-col gap-1 mt-2">
            <span className="text-sm font-medium text-gray-700">
              By {item.metadata?.Author || "Not specified"}
            </span>
            <span className="text-sm text-gray-500">
              Published in {item.metadata?.Year-Of-Publication || "Not specified"}
            </span>
          </div>
          <p className="text-xs text-gray-500 mt-1 font-mono">
            ID: {item.item_id}
          </p>
        </div>

        <div className="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center">
          <span className="text-sm text-gray-500">Relevance Score</span>
          <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded text-sm font-semibold">
            {item.score?.toFixed(4)}
          </span>
        </div>
        {item.similarity_basis && (
          <p className="text-xs text-gray-400 mt-1 italic">
            {item.similarity_basis}
          </p>
        )}
      </div>
    </div>
  );
}
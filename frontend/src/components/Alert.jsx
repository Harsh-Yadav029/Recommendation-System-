import React from "react";
import { AlertTriangle } from "lucide-react";

export function Alert({ title, description }) {
  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-l-4 border-yellow-400 p-4 rounded-md shadow-sm mb-6 flex items-start gap-3">
      <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0 mt-0.5" />
      <div>
        <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-500">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-yellow-700 dark:text-yellow-400 mt-1">
            {description}
          </p>
        )}
      </div>
    </div>
  );
}

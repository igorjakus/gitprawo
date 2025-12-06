import { LegislativeStage } from '../types';

interface LegislativeTrainProps {
  stages: LegislativeStage[];
}

export default function LegislativeTrain({ stages }: LegislativeTrainProps) {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Proces Legislacyjny
      </h3>
      
      <div className="flex items-center space-x-2 overflow-x-auto pb-2">
        {stages.map((stage, index) => (
          <div key={index} className="flex items-center flex-shrink-0">
            {/* Stage box */}
            <div
              className={`
                pipeline-stage px-6 py-3 rounded-md font-medium text-sm
                ${stage.status}
                flex flex-col items-center justify-center min-w-[140px]
              `}
            >
              <div className="flex items-center space-x-2">
                {stage.status === 'completed' && (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    />
                  </svg>
                )}
                {stage.status === 'in-progress' && (
                  <svg
                    className="w-5 h-5 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span className="font-semibold">{stage.name}</span>
              </div>
              {stage.date && (
                <span className="text-xs mt-1 opacity-90">{stage.date}</span>
              )}
            </div>

            {/* Arrow connector */}
            {index < stages.length - 1 && (
              <svg
                className="w-6 h-6 text-gray-400 mx-1 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            )}
          </div>
        ))}
      </div>

      {/* Stage descriptions */}
      <div className="mt-4 space-y-2">
        {stages
          .filter((stage) => stage.description)
          .map((stage, index) => (
            <div
              key={index}
              className="text-sm text-gray-600 border-l-2 border-gray-300 pl-3"
            >
              <span className="font-medium text-gray-900">{stage.name}:</span>{' '}
              {stage.description}
            </div>
          ))}
      </div>
    </div>
  );
}

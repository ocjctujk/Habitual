interface StatCardProps {
  title: string;
  value: number;
  icon: string;
  color: string;
}

export const StatCard = ({ title, value, icon, color }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
    <div className="flex items-center gap-4">
      <div
        className={`h-12 w-12 rounded-xl flex items-center justify-center text-2xl text-white shadow-lg ${color}`}
      >
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
          {title}
        </p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">
          {value}
        </p>
      </div>
    </div>
  </div>
);

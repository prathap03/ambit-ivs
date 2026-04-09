export default function LoadingSpinner() {
  return (
    <div className="min-h-screen flex flex-auto flex-col justify-center items-center p-4 md:p-5">
      <div className="animate-spin inline-block size-6 border-[3px] border-current border-t-transparent text-gray-800 dark:text-indigo-400 rounded-full" role="status" aria-label="loading">
        <span className="sr-only">Loading...</span>
      </div>
    </div>
  );
}

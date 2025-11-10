export default function Success() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center text-white bg-[#050913]">
      <h1 className="text-4xl font-bold mb-3 bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
        Payment Successful 🎉
      </h1>
      <p className="text-white/70 max-w-md">
        Your DopeGuard plan has been activated successfully.
      </p>
      <a href="/dashboard" className="mt-6 bg-cyan-500 px-5 py-2 rounded-lg">
        Go to Dashboard
      </a>
    </div>
  );
}

export default function Cancel() {
  return (
    <div className="h-screen flex flex-col items-center justify-center text-center text-white bg-[#050913]">
      <h1 className="text-4xl font-bold mb-3 text-red-400">
        Payment Cancelled ❌
      </h1>
      <p className="text-white/70">
        No changes have been made to your account.
      </p>
      <a href="/pricing" className="mt-6 bg-gray-700 px-5 py-2 rounded-lg">
        Go Back
      </a>
    </div>
  );
}

export default function EmailVerified() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <h1 className="text-2xl font-bold">Email Verified!</h1>
      <p>Your email has been successfully verified. You can now <a href="/signin" className="text-blue-600 underline">sign in</a>.</p>
    </div>
  );
}
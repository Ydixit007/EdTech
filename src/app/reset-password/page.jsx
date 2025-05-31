import ForgetPasswordPreview from "@/components/ForgotPassword";
import ResetPasswordPreview from "@/components/resetPassword";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm">
        <ResetPasswordPreview />
      </div>
    </div>
  );
}

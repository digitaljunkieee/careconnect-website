import { PageLoader } from "@/components/ui/page-loader";

export default function AdminLoading() {
  return (
    <PageLoader className="min-h-[calc(100dvh-10rem)] rounded-[2rem] lg:min-h-[calc(100dvh-8rem)]" />
  );
}

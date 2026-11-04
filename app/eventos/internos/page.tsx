import { permanentRedirect } from "next/navigation";

export default function InternalEventsPage() {
  permanentRedirect("/eventos#internos");
}

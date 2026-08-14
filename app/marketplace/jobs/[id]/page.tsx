import { redirect } from "next/navigation"

export default function GigRedirect({ params }: { params: { id: string } }) {
  redirect(`/marketplace/gigs/${params.id}`)
}

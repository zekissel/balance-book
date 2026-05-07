import { Outlet } from "react-router";

interface BaseLayoutProps {

}
export default function BaseLayout ({}: BaseLayoutProps) {

  return (
    <main>

      <Outlet />
    </main>
  )
}
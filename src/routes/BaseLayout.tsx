import { Link, Outlet, useLocation } from "react-router";

interface BaseLayoutProps {

}
export default function BaseLayout ({}: BaseLayoutProps) {

  const location = useLocation();

  return (
    <main>
      BaseLayout Component

      { location.pathname === '/login' && <Link to='/plaid'>Cog</Link> }


      <Outlet />
    </main>
  )
}
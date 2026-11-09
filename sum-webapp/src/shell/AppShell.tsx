import { useEffect, useState, type ReactElement } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";
import {
  AppShell as OxygenAppShell,
  ColorSchemeToggle,
  Divider,
  Footer,
  Header,
  Sidebar,
  UserMenu,
} from "@wso2/oxygen-ui";
import { Calculator, LogOut, User } from "@wso2/oxygen-ui-icons-react";
import { Can, useAuthz } from "../authz/gates";
import { currentUser, signOut } from "../authz/session";
import { APP_NAME } from "../appName";

export function AppShell(): ReactElement {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { username } = useAuthz();
  const [email, setEmail] = useState("");

  useEffect(() => {
    void currentUser().then((user) => {
      const value = (user?.profile as Record<string, unknown> | undefined)?.email;
      if (typeof value === "string") setEmail(value);
    });
  }, []);

  const active = pathname.startsWith("/account") ? "" : "calculator";

  return (
    <OxygenAppShell>
      <OxygenAppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>{APP_NAME}</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={username} />
              <UserMenu.Header name={username} email={email} />
              <UserMenu.Item icon={<User />} label="Account" onClick={() => navigate("/account")} />
              <UserMenu.Divider />
              <UserMenu.Logout icon={<LogOut />} label="Sign out" onClick={() => void signOut()} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </OxygenAppShell.Navbar>

      <OxygenAppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Can op="POST /sums">
                <Sidebar.Item id="calculator" link={<Link to="/calculator" />}>
                  <Sidebar.ItemIcon>
                    <Calculator />
                  </Sidebar.ItemIcon>
                  <Sidebar.ItemLabel>Add two numbers</Sidebar.ItemLabel>
                </Sidebar.Item>
              </Can>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </OxygenAppShell.Sidebar>

      <OxygenAppShell.Main>
        <Outlet />
      </OxygenAppShell.Main>

      <OxygenAppShell.Footer>
        <Footer>
          <Footer.Copyright>© WSO2 LLC</Footer.Copyright>
        </Footer>
      </OxygenAppShell.Footer>
    </OxygenAppShell>
  );
}

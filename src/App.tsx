import { createHashRouter, RouterProvider } from "react-router-dom";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Welcome from "./pages/welcome";
import SideBar from "./components/sidebar";
import NewConnection from "./pages/new-conn";
import Connection from "./pages/conn";

const router = createHashRouter([
  {
    path: "/",
    element: <SideBar />,
    // TODO: dedicated errorElement
    errorElement: <Welcome />,
    children: [
      {
        index: true,
        element: <Welcome />,
      },
      {
        path: "new",
        element: <NewConnection />,
      },
      {
        path: "conn/:connId",
        loader: async ({ params }) => params.connId,
        element: <Connection />,
      },
    ],
  },
]);

const theme = createTheme({
  typography: { fontFamily: "Tilt Neon", fontSize: 16 },
  palette: { mode: "dark" },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

export default App;

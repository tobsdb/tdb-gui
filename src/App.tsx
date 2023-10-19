import { createHashRouter, RouterProvider } from "react-router-dom";
import Welcome from "./pages/welcome";

const router = createHashRouter([
  {
    index: true,
    element: <Welcome />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;

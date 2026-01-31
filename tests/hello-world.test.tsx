import { render, screen } from "@testing-library/react";
import HelloWorldPage from "@/app/hello-world/page";

describe("HelloWorldPage", () => {
  it("renders the heading and verification message", () => {
    render(<HelloWorldPage />);

    expect(
      screen.getByRole("heading", { name: /hello world/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/ruta de verificación inicial/i),
    ).toBeInTheDocument();
  });
});

import React from "react";
import { render } from "@testing-library/react";
import App from "../components/App";

describe("App", () => {
  test("renders the welcome message and the three level radios", () => {
    render(<App />);

    expect(document.body.textContent).toContain("Welcome!");
    expect(document.querySelector("input#easy")).toBeTruthy();
    expect(document.querySelector("input#normal")).toBeTruthy();
    expect(document.querySelector("input#hard")).toBeTruthy();
  });
});

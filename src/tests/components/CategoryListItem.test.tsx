import { describe, expect, it, vi } from "vitest";

import { fireEvent, render, screen } from "@testing-library/react";

import CategoryListItem from "@/components/CategoryListItem";
import { AUTO_RETURN_MS } from "@/constants/config";

describe("CategoryListItem", () => {
  const defaultProps = {
    id: "item-1" as const,
    label: "Apple",
    onActivate: vi.fn(),
  };

  it("should render the provided label", () => {
    render(<CategoryListItem {...defaultProps} />);

    expect(
      screen.getByRole("button", { name: "Apple" }),
    ).toBeInTheDocument();
  });

  it("should call onActivate with the item id when clicked", () => {
    const onActivate = vi.fn();

    render(
      <CategoryListItem
        {...defaultProps}
        onActivate={onActivate}
      />,
    );

    fireEvent.click(screen.getByRole("button"));

    expect(onActivate).toHaveBeenCalledTimes(1);
    expect(onActivate).toHaveBeenCalledWith("item-1");
  });

  it("should not render the countdown bar by default", () => {
    const { container } = render(
      <CategoryListItem {...defaultProps} />,
    );

    const countdownBar = container.querySelector(
      '[aria-hidden="true"]',
    );

    expect(countdownBar).not.toBeInTheDocument();
  });

  it("should render the countdown bar when showCountdown is true", () => {
    const { container } = render(
      <CategoryListItem
        {...defaultProps}
        showCountdown
      />,
    );

    const countdownBar = container.querySelector(
      '[aria-hidden="true"]',
    );

    expect(countdownBar).toBeInTheDocument();
  });

  it("should use the default countdown color when bgColorClassName is not provided", () => {
    const { container } = render(
      <CategoryListItem
        {...defaultProps}
        showCountdown
      />,
    );

    const countdownBar = container.querySelector(
      '[aria-hidden="true"]',
    );

    expect(countdownBar).toHaveClass("bg-neutral-300");
  });

  it("should use the custom countdown color when bgColorClassName is provided", () => {
    const { container } = render(
      <CategoryListItem
        {...defaultProps}
        showCountdown
        bgColorClassName="bg-green-500"
      />,
    );

    const countdownBar = container.querySelector(
      '[aria-hidden="true"]',
    );

    expect(countdownBar).toHaveClass("bg-green-500");
  });

  it("should apply the correct countdown animation duration", () => {
    const { container } = render(
      <CategoryListItem
        {...defaultProps}
        showCountdown
      />,
    );

    const countdownBar = container.querySelector(
      '[aria-hidden="true"]',
    );

    expect(countdownBar).toHaveStyle({
      animation: `cb-shrink ${AUTO_RETURN_MS}ms linear forwards`,
    });
  });

  it("should set a tooltip when countdown is shown", () => {
    render(
      <CategoryListItem
        {...defaultProps}
        showCountdown
      />,
    );

    expect(
      screen.getByRole("button"),
    ).toHaveAttribute(
      "title",
      "Click to send back to the list",
    );
  });

  it("should not set a tooltip when countdown is hidden", () => {
    render(<CategoryListItem {...defaultProps} />);

    expect(
      screen.getByRole("button"),
    ).not.toHaveAttribute("title");
  });
});
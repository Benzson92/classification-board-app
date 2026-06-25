import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import CategoryList from "@/components/CategoryList";

import { CATEGORIES } from "@/constants/config";

import { useItemAssignment } from "@/hooks/useItemAssignment.hook";

import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

vi.mock("@/hooks/useItemAssignment.hook");

const mockUseItemAssignment = vi.mocked(useItemAssignment);

const mockAssign = vi.fn();
const mockUnassign = vi.fn();

describe("CategoryList", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    const firstCategory = CATEGORIES[0];

    mockUseItemAssignment.mockReturnValue({
      categorizedItems: {
        unassignedItems: [
          {
            id: "tomato-id",
            name: "Tomato",
            categoryId: firstCategory.id,
            categoryAssignmentStatus:
              CategoryAssignmentStatus.Unassigned,
          },
        ],
        itemsByCategory: {
          [firstCategory.id]: [
            {
              id: "carrot-id",
              name: "Carrot",
              categoryId: firstCategory.id,
              categoryAssignmentStatus:
                CategoryAssignmentStatus.Assigned,
            },
          ],

          ...Object.fromEntries(
            CATEGORIES.slice(1).map((category) => [
              category.id,
              [],
            ]),
          ),
        },
      },
      assign: mockAssign,
      unassign: mockUnassign,
    });
  });

  it("should render all category columns", () => {
    render(<CategoryList items={[]} />);

    CATEGORIES.forEach((category) => {
      expect(
        screen.getByText(category.label),
      ).toBeInTheDocument();
    });
  });

  it("should render unassigned items", () => {
    render(<CategoryList items={[]} />);

    expect(
      screen.getByText("Tomato"),
    ).toBeInTheDocument();
  });

  it("should render categorized items", () => {
    render(<CategoryList items={[]} />);

    expect(
      screen.getByText("Carrot"),
    ).toBeInTheDocument();
  });

  it("should call assign when an unassigned item is clicked", async () => {
    const user = userEvent.setup();

    render(<CategoryList items={[]} />);

    await user.click(screen.getByText("Tomato"));

    expect(mockAssign).toHaveBeenCalledTimes(1);
    expect(mockAssign).toHaveBeenCalledWith("tomato-id");
  });

  it("should call unassign when an assigned item is clicked", async () => {
    const user = userEvent.setup();

    render(<CategoryList items={[]} />);

    await user.click(screen.getByText("Carrot"));

    expect(mockUnassign).toHaveBeenCalledTimes(1);
    expect(mockUnassign).toHaveBeenCalledWith("carrot-id");
  });

  it("should pass items to useItemAssignment", () => {
    const items = [
      {
        type: "vegetable",
        name: "Tomato",
      },
    ];

    render(<CategoryList items={items} />);

    expect(mockUseItemAssignment).toHaveBeenCalledWith(items);
  });

  it("should render even when a category entry is missing", () => {
    mockUseItemAssignment.mockReturnValue({
      categorizedItems: {
        unassignedItems: [],
        itemsByCategory: {},
      },
      assign: mockAssign,
      unassign: mockUnassign,
    });
  
    expect(() =>
      render(<CategoryList items={[]} />),
    ).not.toThrow();
  });
});
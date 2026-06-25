import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi, beforeEach } from "vitest";

import type {
  CategoryItem,
  ItemId,
} from "@/models/categoryAssignment.model";
import { CategoryAssignmentStatus } from "@/models/categoryAssignment.model";

import CategoryListColumn from "@/components/CategoryListColumn";

const categoryListItemMock = vi.fn();

vi.mock("@/components/CategoryListItem", () => ({
  default: (props: {
    readonly id: ItemId;
    readonly label: string;
    readonly onActivate: (id: ItemId) => void;
    readonly showCountdown?: boolean;
    readonly bgColorClassName?: string;
  }) => {
    categoryListItemMock(props);

    return <div>{props.label}</div>;
  },
}));

const createCategoryItem = (
  overrides: Partial<CategoryItem> = {},
): CategoryItem => ({
  id: "item-1" as ItemId,
  name: "Apple",
  categoryId: "fruit" as never,
  categoryAssignmentStatus:
    CategoryAssignmentStatus.Unassigned,
  ...overrides,
});

describe("CategoryListColumn", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  it("should render the title when provided", () => {
    render(
      <CategoryListColumn
        title="Fruits"
        items={[]}
        onItemActivate={vi.fn()}
      />,
    );

    expect(screen.getByText("Fruits")).toBeInTheDocument();
  });

  it("should not render a header when title is not provided", () => {
    render(
      <CategoryListColumn
        items={[]}
        onItemActivate={vi.fn()}
      />,
    );

    expect(
      screen.queryByRole("heading"),
    ).not.toBeInTheDocument();
  });

  it("should render the empty hint when there are no items", () => {
    render(
      <CategoryListColumn
        items={[]}
        emptyHint="No items available"
        onItemActivate={vi.fn()}
      />,
    );

    expect(
      screen.getByText("No items available"),
    ).toBeInTheDocument();
  });

  it("should not render the empty hint when items exist", () => {
    render(
      <CategoryListColumn
        items={[createCategoryItem()]}
        emptyHint="No items available"
        onItemActivate={vi.fn()}
      />,
    );

    expect(
      screen.queryByText("No items available"),
    ).not.toBeInTheDocument();
  });

  it("should render all items", () => {
    render(
      <CategoryListColumn
        items={[
          createCategoryItem({
            id: "item-1" as ItemId,
            name: "Apple",
          }),
          createCategoryItem({
            id: "item-2" as ItemId,
            name: "Banana",
          }),
        ]}
        onItemActivate={vi.fn()}
      />,
    );

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.getByText("Banana")).toBeInTheDocument();
  });

  it("should render all item labels exactly once", () => {
    render(
      <CategoryListColumn
        items={[
          createCategoryItem({
            id: "item-1" as ItemId,
            name: "Apple",
          }),
          createCategoryItem({
            id: "item-2" as ItemId,
            name: "Banana",
          }),
        ]}
        onItemActivate={vi.fn()}
      />,
    );

    expect(screen.getAllByText("Apple")).toHaveLength(1);
    expect(screen.getAllByText("Banana")).toHaveLength(1);
  });

  it("should pass the correct props to CategoryListItem", () => {
    const onItemActivate = vi.fn();

    const item = createCategoryItem({
      id: "item-123" as ItemId,
      name: "Apple",
    });

    render(
      <CategoryListColumn
        items={[item]}
        showCountdown
        bgColorClassName="bg-red-500"
        onItemActivate={onItemActivate}
      />,
    );

    expect(categoryListItemMock).toHaveBeenCalledTimes(1);

    expect(categoryListItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        id: item.id,
        label: item.name,
        onActivate: onItemActivate,
        showCountdown: true,
        bgColorClassName: "bg-red-500",
      }),
    );
  });

  it("should pass showCountdown as false by default", () => {
    render(
      <CategoryListColumn
        items={[createCategoryItem()]}
        onItemActivate={vi.fn()}
      />,
    );

    expect(categoryListItemMock).toHaveBeenCalledWith(
      expect.objectContaining({
        showCountdown: false,
      }),
    );
  });

  it("should render nothing except the container when items and emptyHint are empty", () => {
    render(
      <CategoryListColumn
        items={[]}
        onItemActivate={vi.fn()}
      />,
    );

    expect(screen.queryByText(/.+/)).not.toBeInTheDocument();
  });

  it("should render multiple CategoryListItem components", () => {
    render(
      <CategoryListColumn
        items={[
          createCategoryItem({
            id: "item-1" as ItemId,
          }),
          createCategoryItem({
            id: "item-2" as ItemId,
          }),
          createCategoryItem({
            id: "item-3" as ItemId,
          }),
        ]}
        onItemActivate={vi.fn()}
      />,
    );

    expect(categoryListItemMock).toHaveBeenCalledTimes(3);
  });
});
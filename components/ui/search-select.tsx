"use client";

import * as React from "react";
import { Select as SelectPrimitive } from "@base-ui/react/select";
import { ChevronDownIcon, ChevronUpIcon, CheckIcon, Search } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SearchSelectOption {
  value: string;
  label: string;
  icon?: React.ReactNode;
}

interface SearchSelectProps {
  options: SearchSelectOption[];
  value?: string;
  onValueChange?: (value: string | null) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  className?: string;
  disabled?: boolean;
  name?: string;
  required?: boolean;
}

export function SearchSelect({
  options,
  value,
  onValueChange,
  placeholder = "Select an option",
  searchPlaceholder = "Search...",
  className,
  disabled,
  name,
  required,
}: SearchSelectProps) {
  const [query, setQuery] = React.useState("");

  const filtered = query.trim()
    ? options.filter((o) => o.label.toLowerCase().startsWith(query.toLowerCase()))
    : options;

  const [internalValue, setInternalValue] = React.useState(value ?? "");
  const isControlled = value !== undefined;
  const currentValue = isControlled ? value : internalValue;

  const selected = options.find((o) => o.value === currentValue);

  return (
    <SelectPrimitive.Root
      value={currentValue}
      onValueChange={(v) => {
        if (!isControlled) setInternalValue(v ?? "");
        onValueChange?.(v);
      }}
      name={name}
      required={required}
      disabled={disabled}
    >
      <SelectPrimitive.Trigger
        className={cn(
          "flex h-11 w-full items-center justify-between gap-1.5 rounded-lg border border-input bg-transparent py-2 pr-2 pl-2.5 text-sm whitespace-nowrap transition-colors outline-none select-none",
          "focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "data-placeholder:text-muted-foreground",
          "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
          className
        )}
      >
        <SelectPrimitive.Value placeholder={placeholder}>
          {() =>
            selected ? (
              <span className="flex items-center gap-2">
                {selected.icon && <span className="shrink-0">{selected.icon}</span>}
                {selected.label}
              </span>
            ) : null
          }
        </SelectPrimitive.Value>
        <SelectPrimitive.Icon
          render={<ChevronDownIcon className="pointer-events-none size-4 text-muted-foreground" />}
        />
      </SelectPrimitive.Trigger>

      <SelectPrimitive.Portal>
        <SelectPrimitive.Positioner
          side="bottom"
          sideOffset={4}
          align="center"
          alignItemWithTrigger
          className="isolate z-50"
          style={{ width: "var(--anchor-width)" }}
        >
          <SelectPrimitive.Popup
            className={cn(
              "relative isolate z-50 min-w-full origin-[var(--transform-origin)] rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10",
              "duration-100 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95",
              "data-[side=bottom]:slide-in-from-top-2 data-[side=top]:slide-in-from-bottom-2"
            )}
          >
            {/* Search input — outside the List so it never gets treated as an item */}
            <div className="flex items-center gap-2 border-b border-border px-2.5 py-2">
              <Search className="size-3.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => e.stopPropagation()}
                // Stop all keyboard events so Base UI typeahead never fires
                onKeyDown={(e) => e.stopPropagation()}
                onKeyUp={(e) => e.stopPropagation()}
                placeholder={searchPlaceholder}
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>

            <SelectPrimitive.ScrollUpArrow className="top-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1">
              <ChevronUpIcon className="size-4" />
            </SelectPrimitive.ScrollUpArrow>

            <SelectPrimitive.List className="max-h-56 overflow-y-auto p-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-sm text-muted-foreground">
                  No results found
                </div>
              ) : (
                filtered.map((option) => (
                  <SelectPrimitive.Item
                    key={option.value}
                    value={option.value}
                    className={cn(
                      "relative flex w-full cursor-default items-center gap-1.5 rounded-md py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
                      "focus:bg-accent focus:text-accent-foreground",
                      "data-disabled:pointer-events-none data-disabled:opacity-50",
                      "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
                    )}
                  >
                    <SelectPrimitive.ItemText className="flex flex-1 items-center gap-2 whitespace-nowrap">
                      {option.icon && <span className="shrink-0">{option.icon}</span>}
                      {option.label}
                    </SelectPrimitive.ItemText>
                    <SelectPrimitive.ItemIndicator
                      render={
                        <span className="pointer-events-none absolute right-2 flex size-4 items-center justify-center" />
                      }
                    >
                      <CheckIcon className="pointer-events-none" />
                    </SelectPrimitive.ItemIndicator>
                  </SelectPrimitive.Item>
                ))
              )}
            </SelectPrimitive.List>

            <SelectPrimitive.ScrollDownArrow className="bottom-0 z-10 flex w-full cursor-default items-center justify-center bg-popover py-1">
              <ChevronDownIcon className="size-4" />
            </SelectPrimitive.ScrollDownArrow>
          </SelectPrimitive.Popup>
        </SelectPrimitive.Positioner>
      </SelectPrimitive.Portal>
    </SelectPrimitive.Root>
  );
}

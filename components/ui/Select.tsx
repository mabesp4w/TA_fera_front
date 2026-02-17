/** @format */

"use client";

import { useId, useEffect, useState } from "react";
import ReactSelect, { StylesConfig, GroupBase, Theme } from "react-select";
import type { SelectOption } from "./types";
import { useTheme } from "../ThemeProvider";

interface SelectProps {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  isMulti?: boolean;
  isClearable?: boolean;
  isSearchable?: boolean;
  value?: SelectOption | SelectOption[] | null;
  onChange?: (selected: SelectOption | SelectOption[] | null) => void;
  className?: string;
  id?: string;
  isDisabled?: boolean;
  menuPosition?: "absolute" | "fixed";
  menuPlacement?: "auto" | "bottom" | "top";
  menuShouldScrollIntoView?: boolean;
  menuShouldBlockScroll?: boolean;
}

export default function Select({
  label,
  error,
  helperText,
  options,
  placeholder = "Select...",
  isMulti = false,
  isClearable = false,
  isSearchable = true,
  value,
  onChange,
  className = "",
  id,
  menuPosition = "absolute",
  menuPlacement = "bottom",
  menuShouldScrollIntoView = false,
  menuShouldBlockScroll = false,
  isDisabled = false,
}: SelectProps) {
  const generatedId = useId();
  const selectId = id || generatedId;
  const { currentTheme } = useTheme();

  // Get theme colors from CSS variables
  // Use theme-aware fallbacks
  const getInitialColors = () => {
    if (typeof window === "undefined") {
      return {
        b1: "220 14% 96%",
        b2: "220 14% 94%",
        bc: "215 28% 17%",
        p: "262 80% 50%",
        pc: "0 0% 100%",
        er: "0 84% 60%",
        erc: "0 0% 100%",
      };
    }
    
    // Check current theme
    const isDark = currentTheme === "dark" || 
                   document.documentElement.getAttribute("data-theme") === "coffee";
    
    return isDark ? {
      b1: "24 10% 10%",   // Dark background
      b2: "24 10% 15%",   // Dark hover
      bc: "60 9% 98%",    // Light text
      p: "262 80% 50%",
      pc: "0 0% 100%",
      er: "0 84% 60%",
      erc: "0 0% 100%",
    } : {
      b1: "220 14% 96%",  // Light background
      b2: "220 14% 94%",  // Light hover
      bc: "215 28% 17%",  // Dark text
      p: "262 80% 50%",
      pc: "0 0% 100%",
      er: "0 84% 60%",
      erc: "0 0% 100%",
    };
  };

  const [themeColors, setThemeColors] = useState(getInitialColors());

  useEffect(() => {
    if (typeof window !== "undefined") {
      const root = document.documentElement;
      const getColor = (varName: string, fallback: string) => {
        const value = getComputedStyle(root).getPropertyValue(varName).trim();
        // If value is empty or just whitespace, use fallback
        if (!value || value === "") {
          return fallback;
        }
        return value;
      };

      const updateThemeColors = () => {
        // Use requestAnimationFrame to ensure CSS variables are updated
        requestAnimationFrame(() => {
          // Use body element to get computed colors (it already uses the theme)
          const bodyEl = document.body;
          
          // Helper to convert RGB to HSL
          const rgbToHsl = (r: number, g: number, b: number): string => {
            r /= 255;
            g /= 255;
            b /= 255;
            
            const max = Math.max(r, g, b);
            const min = Math.min(r, g, b);
            let h = 0, s = 0, l = (max + min) / 2;
            
            if (max !== min) {
              const d = max - min;
              s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
              
              if (max === r) {
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
              } else if (max === g) {
                h = ((b - r) / d + 2) / 6;
              } else {
                h = ((r - g) / d + 4) / 6;
              }
            }
            
            h = Math.round(h * 360);
            s = Math.round(s * 100);
            l = Math.round(l * 100);
            
            return `${h} ${s}% ${l}%`;
          };
          
          // Determine current theme
          const isDark = currentTheme === "dark" || 
                        root.getAttribute("data-theme") === "coffee";
          
          // Helper to get computed color from CSS variable
          const getComputedColor = (cssVar: string, lightFallback: string, darkFallback: string): string => {
            // Create a test element with the CSS variable
            const testEl = document.createElement("div");
            testEl.style.position = "absolute";
            testEl.style.visibility = "hidden";
            testEl.style.pointerEvents = "none";
            testEl.style.width = "1px";
            testEl.style.height = "1px";
            testEl.style.backgroundColor = `hsl(${cssVar})`;
            bodyEl.appendChild(testEl);
            
            const computed = getComputedStyle(testEl).backgroundColor;
            bodyEl.removeChild(testEl);
            
            // If computed is rgb or rgba, convert to HSL format
            if (computed && (computed.startsWith("rgb") || computed.startsWith("rgba"))) {
              const rgbMatch = computed.match(/\d+/g);
              if (rgbMatch && rgbMatch.length >= 3) {
                const r = parseInt(rgbMatch[0]);
                const g = parseInt(rgbMatch[1]);
                const b = parseInt(rgbMatch[2]);
                
                // Check if color is valid (not transparent/black due to error)
                if (r === 0 && g === 0 && b === 0 && computed.includes("rgba")) {
                  // Transparent or invalid, use fallback
                  return isDark ? darkFallback : lightFallback;
                }
                
                const hsl = rgbToHsl(r, g, b);
                // Only use converted color if it's not pure black (which might indicate error)
                // Pure black in dark theme is valid, but in light theme it's likely an error
                if (hsl === "0 0% 0%" && !isDark) {
                  return lightFallback;
                }
                return hsl;
              }
            }
            
            // Try to get the CSS variable value directly
            const varValue = getColor(cssVar, "");
            // If varValue looks like HSL format (e.g., "220 14% 96%"), use it
            if (varValue && /^\d+\s+\d+%\s+\d+%$/.test(varValue)) {
              return varValue;
            }
            
            // Use fallback based on current theme
            return isDark ? darkFallback : lightFallback;
          };
          
          // Define fallbacks for light and dark themes
          const lightFallbacks = {
            b1: "220 14% 96%",  // Light background
            b2: "220 14% 94%",  // Light hover
            bc: "215 28% 17%",  // Dark text
            p: "262 80% 50%",
            pc: "0 0% 100%",
            er: "0 84% 60%",
            erc: "0 0% 100%",
          };
          
          const darkFallbacks = {
            b1: "24 10% 10%",   // Dark background (coffee theme)
            b2: "24 10% 15%",   // Dark hover
            bc: "60 9% 98%",    // Light text
            p: "262 80% 50%",
            pc: "0 0% 100%",
            er: "0 84% 60%",
            erc: "0 0% 100%",
          };
          
          const colors = {
            b1: getComputedColor("var(--b1)", lightFallbacks.b1, darkFallbacks.b1),
            b2: getComputedColor("var(--b2)", lightFallbacks.b2, darkFallbacks.b2),
            bc: getComputedColor("var(--bc)", lightFallbacks.bc, darkFallbacks.bc),
            p: getComputedColor("var(--p)", lightFallbacks.p, darkFallbacks.p),
            pc: getComputedColor("var(--pc)", lightFallbacks.pc, darkFallbacks.pc),
            er: getComputedColor("var(--er)", lightFallbacks.er, darkFallbacks.er),
            erc: getComputedColor("var(--erc)", lightFallbacks.erc, darkFallbacks.erc),
          };
          
          setThemeColors(colors);
        });
      };

      // Initial update with small delay to ensure theme is applied
      const timeoutId = setTimeout(updateThemeColors, 0);

      // Listen for theme changes
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          if (mutation.type === "attributes" && mutation.attributeName === "data-theme") {
            // Small delay to ensure CSS variables are updated
            setTimeout(updateThemeColors, 10);
          }
        });
      });

      observer.observe(root, {
        attributes: true,
        attributeFilter: ["data-theme"],
      });

      // Also listen for storage changes (theme might change via localStorage)
      const handleStorageChange = () => {
        setTimeout(updateThemeColors, 10);
      };
      window.addEventListener("storage", handleStorageChange);

      return () => {
        clearTimeout(timeoutId);
        observer.disconnect();
        window.removeEventListener("storage", handleStorageChange);
      };
    }
  }, [currentTheme]); // Re-run when theme changes

  const customStyles: StylesConfig<
    SelectOption,
    boolean,
    GroupBase<SelectOption>
  > = {
    control: (base, state) => ({
      ...base,
      borderColor: error
        ? `hsl(${themeColors.er})`
        : state.isFocused
        ? `hsl(${themeColors.p})`
        : `hsl(${themeColors.bc} / 0.2)`,
      boxShadow: state.isFocused
        ? `0 0 0 1px ${error ? `hsl(${themeColors.er})` : `hsl(${themeColors.p})`}`
        : "none",
      "&:hover": {
        borderColor: error ? `hsl(${themeColors.er})` : `hsl(${themeColors.p})`,
      },
      backgroundColor: `hsl(${themeColors.b1})`,
      minHeight: "3rem",
    }),
    menu: (base) => ({
      ...base,
      backgroundColor: `hsl(${themeColors.b1})`,
      border: `1px solid hsl(${themeColors.bc} / 0.2)`,
      borderRadius: "6px",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
      zIndex: 1050,
      marginTop: "0.25rem",
    }),
    menuList: (base) => ({
      ...base,
      maxHeight: "200px",
      overflowY: "auto",
      padding: "8px 4px",
      backgroundColor: `hsl(${themeColors.b1})`,
      borderRadius: "6px",
    }),
    menuPortal: (base) => ({
      ...base,
      zIndex: 1050,
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isSelected
        ? `hsl(${themeColors.p})`
        : state.isFocused
        ? `hsl(${themeColors.b2})`
        : "transparent",
      color: state.isSelected 
        ? `hsl(${themeColors.pc})` 
        : `hsl(${themeColors.bc})`,
      cursor: "pointer",
      padding: "8px 12px",
      borderRadius: "4px",
      margin: "0",
      transition: "all 0.15s ease",
      ":hover": {
        backgroundColor: state.isSelected 
          ? `hsl(${themeColors.p})` 
          : `hsl(${themeColors.b2})`,
        color: state.isSelected 
          ? `hsl(${themeColors.pc})` 
          : `hsl(${themeColors.bc})`,
      },
    }),
    multiValue: (base) => ({
      ...base,
      backgroundColor: `hsl(${themeColors.p})`,
    }),
    multiValueLabel: (base) => ({
      ...base,
      color: `hsl(${themeColors.pc})`,
    }),
    multiValueRemove: (base) => ({
      ...base,
      color: `hsl(${themeColors.pc})`,
      "&:hover": {
        backgroundColor: `hsl(${themeColors.er})`,
        color: `hsl(${themeColors.erc})`,
      },
    }),
    placeholder: (base) => ({
      ...base,
      color: `hsl(${themeColors.bc} / 0.5)`,
    }),
    singleValue: (base) => ({
      ...base,
      color: `hsl(${themeColors.bc})`,
    }),
    input: (base) => ({
      ...base,
      color: `hsl(${themeColors.bc})`,
    }),
    indicatorsContainer: (base) => ({
      ...base,
      color: `hsl(${themeColors.bc})`,
    }),
    indicatorSeparator: (base) => ({
      ...base,
      backgroundColor: `hsl(${themeColors.bc} / 0.2)`,
    }),
    clearIndicator: (base) => ({
      ...base,
      color: `hsl(${themeColors.bc})`,
      "&:hover": {
        color: `hsl(${themeColors.er})`,
      },
    }),
    dropdownIndicator: (base) => ({
      ...base,
      color: `hsl(${themeColors.bc})`,
      "&:hover": {
        color: `hsl(${themeColors.bc})`,
      },
    }),
  };

  const customTheme = (theme: Theme): Theme => ({
    ...theme,
    colors: {
      ...theme.colors,
      primary: "hsl(var(--p))",
      primary75: "hsl(var(--p) / 0.75)",
      primary50: "hsl(var(--p) / 0.5)",
      primary25: "hsl(var(--p) / 0.25)",
      danger: "hsl(var(--er))",
      dangerLight: "hsl(var(--er) / 0.5)",
      neutral0: "hsl(var(--b1))",
      neutral5: "hsl(var(--b2))",
      neutral10: "hsl(var(--b2))",
      neutral20: "hsl(var(--bc) / 0.2)",
      neutral30: "hsl(var(--bc) / 0.3)",
      neutral40: "hsl(var(--bc) / 0.4)",
      neutral50: "hsl(var(--bc) / 0.5)",
      neutral60: "hsl(var(--bc) / 0.6)",
      neutral70: "hsl(var(--bc) / 0.7)",
      neutral80: "hsl(var(--bc) / 0.8)",
      neutral90: "hsl(var(--bc))",
    },
    spacing: {
      ...theme.spacing,
      baseUnit: 4,
      controlHeight: 48,
      menuGutter: 4,
    },
  });

  const reactSelectOptions = options.map((opt) => ({
    value: opt.value,
    label: opt.label,
    isDisabled: opt.disabled,
  }));

  const selectedValue = isMulti
    ? Array.isArray(value)
      ? reactSelectOptions.filter((opt) =>
          value.some((v) => v.value === opt.value)
        )
      : null
    : value && !Array.isArray(value)
    ? reactSelectOptions.find((opt) => opt.value === value.value) || null
    : null;

  return (
    <div className={`form-control w-full ${className}`}>
      {label && (
        <label className="label" htmlFor={selectId}>
          <span className="label-text">{label}</span>
        </label>
      )}
      <ReactSelect<SelectOption, boolean>
        instanceId={selectId}
        options={reactSelectOptions}
        placeholder={placeholder}
        isMulti={isMulti}
        isClearable={isClearable}
        isSearchable={isSearchable}
        isDisabled={isDisabled}
        value={selectedValue}
        onChange={(selected) => {
          if (onChange) {
            if (isMulti) {
              onChange(
                Array.isArray(selected)
                  ? selected.map((s) => ({ value: s.value, label: s.label }))
                  : null
              );
            } else {
              const singleSelected = selected as SelectOption | null;
              onChange(
                singleSelected
                  ? { value: singleSelected.value, label: singleSelected.label }
                  : null
              );
            }
          }
        }}
        styles={customStyles}
        theme={customTheme}
        className={className}
        menuPosition={menuPosition}
        menuPlacement={menuPlacement}
        menuShouldScrollIntoView={menuShouldScrollIntoView}
        menuShouldBlockScroll={menuShouldBlockScroll}
        menuPortalTarget={
          menuPosition === "fixed" && typeof document !== "undefined"
            ? document.body
            : null
        }
      />
      {error && (
        <label className="label">
          <span className="label-text-alt text-error">{error}</span>
        </label>
      )}
      {helperText && !error && (
        <label className="label">
          <span className="label-text-alt text-base-content/70">
            {helperText}
          </span>
        </label>
      )}
    </div>
  );
}

"use client"

import * as React from "react"
import * as RechartsPrimitive from "recharts"
import { cn } from "@/lib/utils"

// Types
type ChartContextProps = {
  config: ChartConfig
}

export type ChartConfig = {
  [k in string]: {
    label?: React.ReactNode
    icon?: React.ComponentType
  } & (
    | { color?: string; theme?: never }
    | { color?: never; theme: Record<string, string> }
  )
}

// Chart Context
const ChartContext = React.createContext<ChartContextProps | null>(null)

function useChart() {
  const context = React.useContext(ChartContext)

  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />")
  }

  return context
}

// Chart Container
const ChartContainer = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    config: ChartConfig
    children: React.ComponentProps<
      typeof RechartsPrimitive.ResponsiveContainer
    >["children"]
  }
>(({ id, className, children, config, ...props }, ref) => {
  const uniqueId = React.useId()
  const chartId = `chart-${id || uniqueId.replace(/:/g, "")}`

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        ref={ref}
        className={cn(
          "flex aspect-video justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-border/50 [&_.recharts-curve.recharts-tooltip-cursor]:stroke-border [&_.recharts-dot[stroke='#fff']]:stroke-transparent [&_.recharts-layer]:outline-none [&_.recharts-polar-grid_[stroke='#ccc']]:stroke-border [&_.recharts-radial-bar-background-sector]:fill-muted [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted [&_.recharts-reference-line_[stroke='#ccc']]:stroke-border [&_.recharts-sector[stroke='#fff']]:stroke-transparent [&_.recharts-sector]:outline-none [&_.recharts-surface]:outline-none",
          className
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  )
})
ChartContainer.displayName = "Chart"

const ChartStyle = ({ id, config }: { id: string; config: ChartConfig }) => {
  const colorConfig = Object.entries(config).filter(
    ([, config]) => config.theme || config.color
  )

  if (!colorConfig.length) {
    return null
  }

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(config)
          .filter(([, config]) => config.theme || config.color)
          .map(([key, itemConfig]) => {
            if ("color" in itemConfig && itemConfig.color) {
              return `[data-chart="${id}"] .color-${key} { color: ${itemConfig.color}; }`
            }
            if ("theme" in itemConfig && itemConfig.theme) {
              return Object.entries(itemConfig.theme)
                .map(
                  ([mode, value]) =>
                    `[data-chart="${id}"][data-theme="${mode}"] .color-${key} { color: ${value}; }`
                )
                .join("\n")
            }
            return ""
          })
          .join("\n"),
      }}
    />
  )
}

// Chart Tooltip
const ChartTooltip = RechartsPrimitive.Tooltip

const ChartTooltipContent = React.forwardRef<HTMLDivElement, Record<string, unknown>>(
  (
    {
      active,
      payload,
      className,
      indicator = "dot",
      hideLabel = false,
      hideIndicator = false,
      label,
      labelFormatter,
      labelClassName,
      formatter,
      color,
      nameKey,
      labelKey,
    }: {
      active?: boolean;
      payload?: unknown[];
      className?: string;
      indicator?: "line" | "dot" | "dashed";
      hideLabel?: boolean;
      hideIndicator?: boolean;
      label?: string;
      labelFormatter?: (label: string, payload: unknown[]) => string;
      labelClassName?: string;
      formatter?: (value: unknown, name: string) => [string, string];
      color?: string;
      nameKey?: string;
      labelKey?: string;
    },
    ref
  ) => {
    const { config } = useChart()

    const tooltipLabel = React.useMemo(() => {
      if (hideLabel || !payload?.length) {
        return null
      }

      const [item] = payload
      const key = `${labelKey || (item as Record<string, unknown>).dataKey || (item as Record<string, unknown>).name || "value"}`
      const itemConfig = getPayloadConfigFromPayload(config, item as Record<string, unknown>, key)
      const value =
        !labelKey && typeof label === "string"
          ? config[label as keyof typeof config]?.label || label
          : itemConfig?.label

      if (labelFormatter && typeof label !== "undefined") {
        return labelFormatter(label, payload)
      }

      return value
    }, [
      label,
      labelFormatter,
      payload,
      hideLabel,
      labelKey,
      config,
    ])

    if (!active || !payload?.length) {
      return null
    }

    const nestLabel = payload.length === 1 && indicator !== "dot"

    return (
      <div
        ref={ref}
        className={cn(
          "grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs shadow-xl",
          className
        )}
      >
        {!nestLabel ? (
          <div className={cn("font-medium", labelClassName)}>
            {tooltipLabel}
          </div>
        ) : null}
        <div className="grid gap-1.5">
          {payload.map((item) => {
            const typedItem = item as Record<string, unknown>;
            const key = `${nameKey || typedItem.name || typedItem.dataKey || "value"}`
            const itemConfig = getPayloadConfigFromPayload(config, typedItem, key)
            const indicatorColor = (color || (typedItem.payload as Record<string, unknown>)?.fill || typedItem.color) as string

            return (
              <div
                key={typedItem.dataKey as string}
                className={cn(
                  "flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground",
                  indicator === "dot" && "items-center"
                )}
              >
                {formatter && typedItem?.value !== undefined && typedItem.name ? (
                  formatter(typedItem.value, typedItem.name as string)
                ) : (
                  <>
                    {indicator === "dot" && !hideIndicator ? (
                      <div
                        className="shrink-0 rounded-full border border-border"
                        style={{
                          backgroundColor: indicatorColor,
                        }}
                      />
                    ) : indicator === "line" && !hideIndicator ? (
                      <div
                        className="h-px w-3 shrink-0 border border-border"
                        style={{
                          borderColor: indicatorColor,
                        }}
                      />
                    ) : indicator === "dashed" && !hideIndicator ? (
                      <div
                        className="h-px w-3 shrink-0 border border-dashed border-border"
                        style={{
                          borderColor: indicatorColor,
                        }}
                      />
                    ) : null}
                    <div
                      className={cn(
                        "flex flex-1 justify-between leading-none",
                        nestLabel ? "items-end" : "items-center"
                      )}
                    >
                      <div className="grid gap-1.5">
                        {nestLabel ? (
                          <div className={cn("font-medium", labelClassName)}>
                            {tooltipLabel}
                          </div>
                        ) : null}
                        <div className="text-muted-foreground">
                          {(itemConfig?.icon as React.ComponentType) ? (
                            React.createElement(itemConfig!.icon as React.ComponentType)
                          ) : (
                            (itemConfig?.label || typedItem.name) as React.ReactNode
                          )}
                        </div>
                      </div>
                      {(typedItem.value as React.ReactNode) && (
                        <div className="font-mono font-medium tabular-nums text-foreground">
                          {typedItem.value as React.ReactNode}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }
)
ChartTooltipContent.displayName = "ChartTooltipContent"

// Helper to get payload config from payload
function getPayloadConfigFromPayload(
  config: ChartConfig,
  payload: unknown,
  key: string
) {
  if (typeof payload !== "object" || payload === null) {
    return undefined
  }

  const payloadPayload =
    "payload" in payload &&
    typeof payload.payload === "object" &&
    payload.payload !== null
      ? payload.payload
      : undefined

  let configLabelKey: string = key

  if (
    key in config ||
    (payloadPayload && configLabelKey in payloadPayload)
  ) {
    configLabelKey = key
  } else if (
    "dataKey" in payload &&
    typeof payload.dataKey === "string" &&
    payload.dataKey in config
  ) {
    configLabelKey = payload.dataKey
  } else if (
    "name" in payload &&
    typeof payload.name === "string" &&
    payload.name in config
  ) {
    configLabelKey = payload.name
  }

  return config[configLabelKey]
}

// Export all recharts components
export {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Funnel,
  FunnelChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  Radar,
  RadarChart,
  RadialBar,
  RadialBarChart,
  Rectangle,
  ReferenceArea,
  ReferenceDot,
  ReferenceLine,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Sector,
  Surface,
  Treemap,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts"

export {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  useChart,
}

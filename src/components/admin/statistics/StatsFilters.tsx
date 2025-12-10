import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Download, Calendar } from "lucide-react";
import { StatsPeriod } from "./types";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { useState } from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

interface StatsFiltersProps {
    period: StatsPeriod;
    onPeriodChange: (period: StatsPeriod) => void;
    onExport: () => void;
    dateRange?: { from: Date; to: Date };
    onDateRangeChange?: (range: { from: Date; to: Date } | undefined) => void;
}

export const StatsFilters = ({
    period,
    onPeriodChange,
    onExport,
    dateRange,
    onDateRangeChange,
}: StatsFiltersProps) => {
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row gap-2">
            <Select value={period} onValueChange={(v) => onPeriodChange(v as StatsPeriod)}>
                <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="week">Cette semaine</SelectItem>
                    <SelectItem value="month">Ce mois</SelectItem>
                    <SelectItem value="last_month">Mois dernier</SelectItem>
                    <SelectItem value="year">Cette année</SelectItem>
                    <SelectItem value="last_year">Année dernière</SelectItem>
                    <SelectItem value="custom">Personnalisé</SelectItem>
                </SelectContent>
            </Select>

            {period === "custom" && (
                <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
                    <PopoverTrigger asChild>
                        <Button
                            variant="outline"
                            className={cn(
                                "w-[240px] justify-start text-left font-normal",
                                !dateRange && "text-muted-foreground"
                            )}
                        >
                            <Calendar className="mr-2 h-4 w-4" />
                            {dateRange?.from ? (
                                dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                                        {format(dateRange.to, "dd/MM/yyyy")}
                                    </>
                                ) : (
                                    format(dateRange.from, "dd/MM/yyyy")
                                )
                            ) : (
                                <span>Choisir une période</span>
                            )}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                        <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange?.from}
                            selected={dateRange as any}
                            onSelect={(range: any) => {
                                onDateRangeChange?.(range);
                            }}
                            numberOfMonths={2}
                        />
                    </PopoverContent>
                </Popover>
            )}

            <Button variant="outline" onClick={onExport}>
                <Download className="h-4 w-4 mr-2" />
                Exporter
            </Button>
        </div>
    );
};

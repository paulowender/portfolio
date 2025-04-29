'use client';

import React from 'react';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MagnifyingGlassIcon, FunnelIcon, XMarkIcon } from '@heroicons/react/24/outline';
import {
  REMINDER_CATEGORIES,
  REMINDER_PRIORITIES,
  ReminderCategory,
  ReminderPriority,
} from '@/types/reminder';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface ReminderFiltersProps {
  onFilterChange: (filters: ReminderFilters) => void;
}

export interface ReminderFilters {
  search: string;
  categories: ReminderCategory[];
  priorities: ReminderPriority[];
  completed: boolean | null;
  upcoming: boolean;
}

export default function ReminderFilters({ onFilterChange }: ReminderFiltersProps) {
  const [search, setSearch] = useState('');
  const [categories, setCategories] = useState<ReminderCategory[]>([]);
  const [priorities, setPriorities] = useState<ReminderPriority[]>([]);
  const [completed, setCompleted] = useState<boolean | null>(null);
  const [upcoming, setUpcoming] = useState(false);
  // Create a ref to track if this is the first render
  const isFirstRender = React.useRef(true);

  // Apply filters when they change
  useEffect(() => {
    // Create a filters object
    const filters = {
      search,
      categories,
      priorities,
      completed,
      upcoming,
    };

    // Skip the first render to prevent unnecessary updates
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    // Call onFilterChange with the current filters
    onFilterChange(filters);
  }, [search, categories, priorities, completed, upcoming, onFilterChange]);

  // Toggle category filter
  const toggleCategory = (category: ReminderCategory) => {
    if (categories.includes(category)) {
      setCategories(categories.filter((c) => c !== category));
    } else {
      setCategories([...categories, category]);
    }
  };

  // Toggle priority filter
  const togglePriority = (priority: ReminderPriority) => {
    if (priorities.includes(priority)) {
      setPriorities(priorities.filter((p) => p !== priority));
    } else {
      setPriorities([...priorities, priority]);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearch('');
    setCategories([]);
    setPriorities([]);
    setCompleted(null);
    setUpcoming(false);
  };

  // Check if any filters are active
  const hasActiveFilters =
    search || categories.length > 0 || priorities.length > 0 || completed !== null || upcoming;

  return (
    <div className="mb-6 space-y-4">
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-grow">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <Input
            type="text"
            placeholder="Buscar lembretes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
            >
              <XMarkIcon className="h-5 w-5" />
            </button>
          )}
        </div>

        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant={hasActiveFilters ? 'default' : 'outline'}
              className="flex items-center gap-2"
            >
              <FunnelIcon className="h-4 w-4" />
              <span>Filtros</span>
              {hasActiveFilters && (
                <Badge className="ml-1 bg-white text-black">
                  {categories.length +
                    priorities.length +
                    (completed !== null ? 1 : 0) +
                    (upcoming ? 1 : 0)}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-gray-800 border border-gray-700" side="bottom">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">Filtros</h3>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={resetFilters} className="h-8 text-xs">
                    Limpar filtros
                  </Button>
                )}
              </div>

              <Tabs defaultValue="categories" className="w-full">
                <TabsList className="grid grid-cols-3">
                  <TabsTrigger value="categories">Categorias</TabsTrigger>
                  <TabsTrigger value="priorities">Prioridades</TabsTrigger>
                  <TabsTrigger value="status">Status</TabsTrigger>
                </TabsList>

                <TabsContent value="categories" className="pt-2">
                  <div className="space-y-2">
                    {REMINDER_CATEGORIES.map((category) => (
                      <div key={category.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`category-${category.value}`}
                          checked={categories.includes(category.value)}
                          onCheckedChange={() => toggleCategory(category.value)}
                        />
                        <Label
                          htmlFor={`category-${category.value}`}
                          className="flex items-center cursor-pointer"
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: category.color }}
                          />
                          {category.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="priorities" className="pt-2">
                  <div className="space-y-2">
                    {REMINDER_PRIORITIES.map((priority) => (
                      <div key={priority.value} className="flex items-center space-x-2">
                        <Checkbox
                          id={`priority-${priority.value}`}
                          checked={priorities.includes(priority.value)}
                          onCheckedChange={() => togglePriority(priority.value)}
                        />
                        <Label
                          htmlFor={`priority-${priority.value}`}
                          className="flex items-center cursor-pointer"
                        >
                          <div
                            className="w-3 h-3 rounded-full mr-2"
                            style={{ backgroundColor: priority.color }}
                          />
                          {priority.label}
                        </Label>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                <TabsContent value="status" className="pt-2">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="completed-true"
                          checked={completed === true}
                          onCheckedChange={() => setCompleted(completed === true ? null : true)}
                        />
                        <Label htmlFor="completed-true" className="cursor-pointer">
                          Concluídos
                        </Label>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="completed-false"
                          checked={completed === false}
                          onCheckedChange={() => setCompleted(completed === false ? null : false)}
                        />
                        <Label htmlFor="completed-false" className="cursor-pointer">
                          Pendentes
                        </Label>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-gray-700">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="upcoming"
                          checked={upcoming}
                          onCheckedChange={(checked) => setUpcoming(checked as boolean)}
                        />
                        <Label htmlFor="upcoming" className="cursor-pointer">
                          Próximos 7 dias
                        </Label>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-end pt-2">
                <PopoverTrigger asChild>
                  <Button size="sm">Aplicar</Button>
                </PopoverTrigger>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filters display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="flex flex-wrap gap-2"
        >
          {categories.map((category) => {
            const categoryInfo = REMINDER_CATEGORIES.find((c) => c.value === category);
            return (
              <Badge
                key={`cat-${category}`}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
                style={{ borderColor: categoryInfo?.color }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: categoryInfo?.color }}
                />
                <span>{categoryInfo?.label}</span>
                <button
                  onClick={() => toggleCategory(category)}
                  className="ml-1 text-gray-400 hover:text-gray-300"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {priorities.map((priority) => {
            const priorityInfo = REMINDER_PRIORITIES.find((p) => p.value === priority);
            return (
              <Badge
                key={`pri-${priority}`}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
                style={{ borderColor: priorityInfo?.color }}
              >
                <div
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: priorityInfo?.color }}
                />
                <span>{priorityInfo?.label}</span>
                <button
                  onClick={() => togglePriority(priority)}
                  className="ml-1 text-gray-400 hover:text-gray-300"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </Badge>
            );
          })}

          {completed !== null && (
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
              <span>{completed ? 'Concluídos' : 'Pendentes'}</span>
              <button
                onClick={() => setCompleted(null)}
                className="ml-1 text-gray-400 hover:text-gray-300"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}

          {upcoming && (
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1">
              <span>Próximos 7 dias</span>
              <button
                onClick={() => setUpcoming(false)}
                className="ml-1 text-gray-400 hover:text-gray-300"
              >
                <XMarkIcon className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </motion.div>
      )}
    </div>
  );
}

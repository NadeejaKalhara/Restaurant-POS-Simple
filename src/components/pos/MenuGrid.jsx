import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';
import { formatCurrency } from '@/utils/currency';

const categoryColors = {
  noodles: 'bg-orange-500/10 text-orange-400 border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-400',
  bites: 'bg-purple-500/10 text-purple-400 border-purple-500/20 dark:bg-purple-500/10 dark:text-purple-400',
  shorties: 'bg-red-500/10 text-red-400 border-red-500/20 dark:bg-red-500/10 dark:text-red-400',
  beverages: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20 dark:bg-cyan-500/10 dark:text-cyan-400',
  rice_curry: 'bg-green-500/10 text-green-400 border-green-500/20 dark:bg-green-500/10 dark:text-green-400',
  fried_rice: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20 dark:bg-yellow-500/10 dark:text-yellow-400',
  kottu: 'bg-blue-500/10 text-blue-400 border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-400',
};

export default function MenuGrid({ items, onItemClick, selectedCategory }) {
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
      {filteredItems.filter(item => item.available !== false).map((item, index) => (
        <motion.div
          key={item._id || item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
        >
          <Card 
            onClick={() => onItemClick(item)}
            className="bg-white dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 cursor-pointer group h-full"
          >
            <CardContent className="p-3 sm:p-4">
              <div className="flex flex-col h-full">
                <Badge 
                  variant="outline" 
                  className={`${categoryColors[item.category] || 'bg-slate-500/10 text-slate-400'} text-xs w-fit mb-2`}
                >
                  {item.category === 'rice_curry' ? 'Rice & Curry' : 
                   item.category === 'fried_rice' ? 'Fried Rice' :
                   item.category ? item.category.charAt(0).toUpperCase() + item.category.slice(1) : ''}
                </Badge>
                <h3 className="text-slate-900 dark:text-white font-medium text-sm mb-1 group-hover:text-amber-500 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-amber-500 dark:text-amber-400 font-semibold mt-auto text-sm sm:text-base">
                  {formatCurrency(item.price)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
      {filteredItems.filter(item => item.available !== false).length === 0 && (
        <div className="col-span-full text-center py-12">
          <p className="text-slate-500 dark:text-slate-400">No items available in this category.</p>
        </div>
      )}
    </div>
  );
}


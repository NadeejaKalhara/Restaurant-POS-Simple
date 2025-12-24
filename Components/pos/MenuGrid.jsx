import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { motion } from 'framer-motion';

const categoryColors = {
  appetizers: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  mains: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  drinks: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  desserts: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
};

export default function MenuGrid({ items, onItemClick, selectedCategory }) {
  const filteredItems = selectedCategory === 'all' 
    ? items 
    : items.filter(item => item.category === selectedCategory);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
      {filteredItems.filter(item => item.available !== false).map((item, index) => (
        <motion.div
          key={item.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.02 }}
        >
          <Card 
            onClick={() => onItemClick(item)}
            className="bg-slate-800/50 border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-200 cursor-pointer group"
          >
            <CardContent className="p-4">
              <div className="flex flex-col h-full">
                <Badge 
                  variant="outline" 
                  className={`${categoryColors[item.category]} text-xs w-fit mb-2`}
                >
                  {item.category}
                </Badge>
                <h3 className="text-white font-medium text-sm mb-1 group-hover:text-amber-400 transition-colors">
                  {item.name}
                </h3>
                <p className="text-amber-800 dark:text-amber-500 font-semibold mt-auto">
                  ${item.price.toFixed(2)}
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
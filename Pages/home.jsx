import React from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Monitor, Settings, UtensilsCrossed } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-amber-500/10 mb-6">
            <UtensilsCrossed className="w-8 h-8 text-amber-500" />
          </div>
          <h1 className="text-4xl font-light text-white tracking-tight mb-2">Restaurant POS</h1>
          <p className="text-slate-400">Select your terminal</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Link to={createPageUrl('POSTerminal')}>
              <Card className="group bg-slate-800/50 border-slate-700/50 hover:border-amber-500/50 hover:bg-slate-800 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-amber-500/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-amber-500/20 transition-colors">
                    <Monitor className="w-7 h-7 text-amber-500" />
                  </div>
                  <h2 className="text-xl font-medium text-white mb-2">POS Terminal</h2>
                  <p className="text-slate-400 text-sm">Take orders and process payments</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Link to={createPageUrl('Admin')}>
              <Card className="group bg-slate-800/50 border-slate-700/50 hover:border-emerald-500/50 hover:bg-slate-800 transition-all duration-300 cursor-pointer h-full">
                <CardContent className="p-8 text-center">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-emerald-500/20 transition-colors">
                    <Settings className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-medium text-white mb-2">Admin Panel</h2>
                  <p className="text-slate-400 text-sm">Manage menu and view orders</p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
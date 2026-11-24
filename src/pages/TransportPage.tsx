import React, { useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { Button } from '../components/common/Button.tsx';
import { Badge } from '../components/common/Badge.tsx';
import { Bus, MapPin, Phone, Users, Clock, ShieldCheck } from 'lucide-react';

export const TransportPage: React.FC = () => {
  const { routes } = useApp();
  const [selectedRoute, setSelectedRoute] = useState(routes[0]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-100 light:text-slate-900">
            Bus Fleet & Transport Logistics
          </h2>
          <p className="text-xs text-slate-400 light:text-slate-600 mt-1">
            Dedicated school transit corridors, vehicle tracking, driver credentials, and stop timetables.
          </p>
        </div>
      </div>

      {/* Routes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {routes.map((rt) => {
          const isSelected = selectedRoute?.id === rt.id;
          const occupancy = Math.round((rt.enrolledStudents / rt.capacity) * 100);

          return (
            <div
              key={rt.id}
              onClick={() => setSelectedRoute(rt)}
              className={`p-5 rounded-xl glass-card border cursor-pointer transition-all duration-200 ${
                isSelected
                  ? 'border-indigo-500 bg-indigo-950/20 light:bg-indigo-50/70 shadow-lg'
                  : 'border-slate-800/80 light:border-slate-200 hover:border-slate-700 light:hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-indigo-400 light:text-indigo-600">
                  {rt.routeCode}
                </span>
                <Badge variant="success" size="sm">
                  {rt.status.replace('_', ' ')}
                </Badge>
              </div>

              <h3 className="mt-3 text-sm font-bold text-slate-100 light:text-slate-900 line-clamp-1">
                {rt.routeName}
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 mt-1">{rt.vehicleType}</p>

              <div className="mt-4 pt-3 border-t border-slate-800/60 light:border-slate-200 space-y-1.5 text-xs text-slate-400 light:text-slate-600 font-mono">
                <div className="flex justify-between">
                  <span>Plate:</span>
                  <span className="text-slate-200 light:text-slate-900 font-semibold">{rt.vehicleNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span>Capacity:</span>
                  <span className="text-slate-200 light:text-slate-900 font-semibold">
                    {rt.enrolledStudents} / {rt.capacity} ({occupancy}%)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Selected Route Stops and Driver Specs */}
      {selectedRoute && (
        <div className="glass-card rounded-xl p-6 border border-slate-800/80 light:border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 light:border-slate-200 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 light:text-slate-900">
                {selectedRoute.routeName} - Transit Stops & Schedule
              </h3>
              <p className="text-xs text-slate-400 light:text-slate-600 font-mono mt-0.5">
                Bus Plate: {selectedRoute.vehicleNumber} · Model: {selectedRoute.vehicleType}
              </p>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800 light:border-slate-200">
              <div className="w-9 h-9 rounded-full bg-slate-800 light:bg-indigo-100 flex items-center justify-center text-slate-300 light:text-indigo-700 font-bold text-xs">
                {selectedRoute.driverName[0]}
              </div>
              <div className="text-xs">
                <p className="font-semibold text-slate-200 light:text-slate-900">{selectedRoute.driverName}</p>
                <p className="text-slate-400 light:text-slate-600 font-mono text-[11px]">{selectedRoute.driverPhone}</p>
              </div>
            </div>
          </div>

          {/* Timeline of Stops */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 light:text-slate-600">
              Morning Pickup & Afternoon Drop Schedule
            </h4>

            <div className="relative pl-6 space-y-6 border-l-2 border-indigo-600/30 ml-2">
              {selectedRoute.stops.map((stop, idx) => (
                <div key={idx} className="relative">
                  {/* Pin Dot */}
                  <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-indigo-500 border-2 border-slate-950 light:border-white" />

                  <div className="p-3.5 rounded-lg bg-slate-900/60 light:bg-slate-50 border border-slate-800/80 light:border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <p className="text-xs font-bold text-slate-100 light:text-slate-900">
                        Stop {idx + 1}: {stop.stopName}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 text-xs font-mono text-slate-300 light:text-slate-700">
                      <span>Pickup: <strong className="text-emerald-400 light:text-emerald-700">{stop.pickupTime}</strong></span>
                      <span>Drop: <strong className="text-indigo-400 light:text-indigo-600">{stop.dropTime}</strong></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

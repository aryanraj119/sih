import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from 'recharts';
import { Cpu, Flame, Target, Zap, ShieldCheck, Activity, BarChart3 } from 'lucide-react';

// Ground-truth empirical metrics evaluated on 2,509 Roboflow Fire-Detection dataset images
const EPOCH_METRICS = [
  { epoch: 'Epoch 1', trainBoxLoss: 2.15, valBoxLoss: 1.88, precision: 48.2, recall: 42.5, mAP50: 51.2, mAP50_95: 31.4 },
  { epoch: 'Epoch 2', trainBoxLoss: 1.24, valBoxLoss: 1.05, precision: 64.5, recall: 61.8, mAP50: 68.9, mAP50_95: 41.2 },
  { epoch: 'Epoch 3 (Best)', trainBoxLoss: 0.68, valBoxLoss: 0.54, precision: 73.95, recall: 70.53, mAP50: 77.37, mAP50_95: 49.58 },
];

const DATASET_SPLIT = [
  { split: 'Training Set (train)', count: 1004, percentage: 40.0, color: '#06b6d4' },
  { split: 'Validation Set (valid)', count: 754, percentage: 30.1, color: '#c084fc' },
  { split: 'Testing Set (test)', count: 751, percentage: 29.9, color: '#10b981' },
];

export const FireModelTrainingChart = () => {
  return (
    <div className="liquid-glass p-6 rounded-2xl border border-white/10 mt-8 bg-gradient-to-br from-black via-zinc-950 to-cyan-950/30">
      
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-400" />
            <span>YOLOv8 Substation Fire & Spark Detection Model Training Statistics</span>
          </h2>
          <p className="text-xs text-gray-400 mt-1">
            Empirical evaluation curves trained on 2,509 annotated high-resolution thermal & optical substation images
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-orange-500/20 text-orange-300 border border-orange-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-orange-400" /> YOLOv8 Nano (3.0M Params)
          </span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-cyan-400" /> 20.8ms (48 FPS)
          </span>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        
        <div className="bg-black/60 p-4 rounded-xl border border-cyan-500/30">
          <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
            <Target className="w-3.5 h-3.5 text-cyan-400" /> Model Precision (P)
          </div>
          <div className="text-2xl font-extrabold text-cyan-400 mt-1">73.95%</div>
          <div className="text-[10px] text-cyan-300 mt-0.5 font-mono">conf=0.45 threshold</div>
        </div>

        <div className="bg-black/60 p-4 rounded-xl border border-purple-500/30">
          <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" /> Model Recall (R)
          </div>
          <div className="text-2xl font-extrabold text-purple-300 mt-1">70.53%</div>
          <div className="text-[10px] text-purple-300 mt-0.5 font-mono">950 Instances Evaluated</div>
        </div>

        <div className="bg-black/60 p-4 rounded-xl border border-orange-500/30">
          <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
            <BarChart3 className="w-3.5 h-3.5 text-orange-400" /> mAP @ IoU 0.50
          </div>
          <div className="text-2xl font-extrabold text-orange-400 mt-1">77.37%</div>
          <div className="text-[10px] text-orange-300 mt-0.5 font-mono">Mean Average Precision</div>
        </div>

        <div className="bg-black/60 p-4 rounded-xl border border-emerald-500/30">
          <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-emerald-400" /> mAP @ IoU 0.50:0.95
          </div>
          <div className="text-2xl font-extrabold text-emerald-400 mt-1">49.58%</div>
          <div className="text-[10px] text-emerald-300 mt-0.5 font-mono">Strict Localization</div>
        </div>

      </div>

      {/* Dual Graphs Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Graph: Training Epoch Accuracy & Loss Convergence Curve */}
        <div className="lg:col-span-2 bg-black/60 p-5 rounded-xl border border-white/10">
          <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-2">
            <span>Accuracy & Training Loss Convergence Curve (Epochs 1-3)</span>
          </h3>
          <p className="text-[11px] text-gray-400 mb-4">
            Shows validation mAP50 (%) scaling upwards while bounding box training loss declines smoothly to 0.54
          </p>

          <div style={{ width: '100%', height: '280px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={EPOCH_METRICS} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="mapGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                <XAxis dataKey="epoch" stroke="#9ca3af" tick={{ fontSize: 11 }} />
                <YAxis yAxisId="left" stroke="#06b6d4" tick={{ fontSize: 11 }} unit="%" domain={[0, 100]} />
                <YAxis yAxisId="right" orientation="right" stroke="#ef4444" tick={{ fontSize: 11 }} domain={[0, 3]} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.92)',
                    borderColor: 'rgba(255, 255, 255, 0.2)',
                    borderRadius: '12px',
                    fontSize: '12px',
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '10px' }} />

                <Area
                  yAxisId="left"
                  type="monotone"
                  dataKey="mAP50"
                  name="Validation mAP50 (%)"
                  fill="url(#mapGradient)"
                  stroke="#06b6d4"
                  strokeWidth={2.5}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="precision"
                  name="Precision (%)"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="recall"
                  name="Recall (%)"
                  stroke="#10b981"
                  strokeWidth={2}
                  dot={{ r: 4 }}
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="valBoxLoss"
                  name="Validation Box Loss"
                  stroke="#ef4444"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  dot={{ r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Graph: Dataset Split & Sample Distribution */}
        <div className="bg-black/60 p-5 rounded-xl border border-white/10 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-white mb-1">
              Dataset Partition (2,509 Images)
            </h3>
            <p className="text-[11px] text-gray-400 mb-4">
              Roboflow Fire-Detection Dataset annotated bounding boxes
            </p>

            <div style={{ width: '100%', height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={DATASET_SPLIT} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
                  <XAxis type="number" stroke="#9ca3af" tick={{ fontSize: 10 }} />
                  <YAxis type="category" dataKey="split" stroke="#9ca3af" tick={{ fontSize: 10 }} width={110} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(0, 0, 0, 0.92)',
                      borderColor: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: '10px',
                      fontSize: '12px',
                    }}
                    formatter={(val: any) => [`${val} Images`, 'Sample Count']}
                  />
                  <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                    {DATASET_SPLIT.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-white/10 text-xs text-gray-300 space-y-1.5">
            <div className="flex justify-between">
              <span className="text-gray-400">Total Annotated Images:</span>
              <strong className="text-white font-mono">2,509 images</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Total Fire Instances:</span>
              <strong className="text-white font-mono">950 instances</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Inference Device:</span>
              <strong className="text-cyan-400 font-mono">CUDA / CPU PyTorch</strong>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

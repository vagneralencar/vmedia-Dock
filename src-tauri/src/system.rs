use serde::{Deserialize, Serialize};
use std::sync::{Arc, Mutex};
use sysinfo::{CpuRefreshKind, MemoryRefreshKind, RefreshKind, System};

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct SystemMetrics {
    pub cpu_usage: f32,
    pub memory_used_mb: u64,
    pub memory_total_mb: u64,
    pub memory_percentage: f32,
}

pub struct MetricsService {
    system: Arc<Mutex<System>>,
}

impl MetricsService {
    pub fn new() -> Self {
        let refresh_kind = RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::nothing().with_cpu_usage())
            .with_memory(MemoryRefreshKind::nothing().with_ram());

        let mut sys = System::new_with_specifics(refresh_kind);
        sys.refresh_specifics(refresh_kind);

        Self {
            system: Arc::new(Mutex::new(sys)),
        }
    }

    pub fn get_metrics(&self) -> Result<SystemMetrics, String> {
        let mut sys = self.system.lock().map_err(|e| e.to_string())?;
        
        let refresh_kind = RefreshKind::nothing()
            .with_cpu(CpuRefreshKind::nothing().with_cpu_usage())
            .with_memory(MemoryRefreshKind::nothing().with_ram());
        
        sys.refresh_specifics(refresh_kind);

        let cpu_usage = sys.global_cpu_usage();
        let total_mem = sys.total_memory() / (1024 * 1024);
        let used_mem = sys.used_memory() / (1024 * 1024);
        let mem_perc = if total_mem > 0 {
            (used_mem as f32 / total_mem as f32) * 100.0
        } else {
            0.0
        };

        Ok(SystemMetrics {
            cpu_usage,
            memory_used_mb: used_mem,
            memory_total_mb: total_mem,
            memory_percentage: mem_perc,
        })
    }
}

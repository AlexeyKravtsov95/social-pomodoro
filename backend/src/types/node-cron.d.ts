declare module 'node-cron' {
  interface ScheduleOptions {
    scheduled?: boolean;
    timezone?: string;
  }
  
  interface ScheduledTask {
    start(): void;
    stop(): void;
    destroy(): void;
    fire(): void;
  }
  
  function schedule(
    expression: string,
    func: () => void,
    options?: ScheduleOptions
  ): ScheduledTask;
}

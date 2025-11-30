/**
	* Scheduler Types für native Job-Scheduling
	*/

declare global {
	/**
		* Interface for scheduled jobs
		*/
	interface ScheduledJob {
		/**
			* Cancel the scheduled job
			*/
		cancel(): void;
	}
}

export { };

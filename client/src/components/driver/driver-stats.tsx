interface DriverStatsProps {
  driver: {
    totalDeliveries: number;
    totalEarnings: string;
    rating: string;
  };
}

export default function DriverStats({ driver }: DriverStatsProps) {
  // Calculate today's stats (mock for now)
  const todayDeliveries = Math.floor(driver.totalDeliveries * 0.1); // Estimate
  const todayEarnings = (parseFloat(driver.totalEarnings) * 0.05).toFixed(2); // Estimate

  return (
    <div className="bg-primary text-white p-4">
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-2xl font-bold">{todayDeliveries}</p>
          <p className="text-sm opacity-90">Today's Deliveries</p>
        </div>
        <div>
          <p className="text-2xl font-bold">${todayEarnings}</p>
          <p className="text-sm opacity-90">Today's Earnings</p>
        </div>
        <div>
          <p className="text-2xl font-bold">{driver.rating}</p>
          <p className="text-sm opacity-90">Rating</p>
        </div>
      </div>
    </div>
  );
}

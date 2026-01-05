import { useState, useEffect } from "react";
import { getData } from "./get";

export function usePortfolioData() {
  const [data, setData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getData<PortfolioData>("portfolio")
      .then((portfolioData) => {
        setData(portfolioData);
        setLoading(false);
      })
      .catch((error) => {
        console.error(error);
        setLoading(false);
      });
  }, []);

  return { data, loading };
}

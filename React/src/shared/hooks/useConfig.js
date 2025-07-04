import { requester } from "App";
import { useCallback, useEffect, useState } from "react";
import { log, toast } from "shared/utils/Utils";

export const useConfig = () => {
  const [configs, setConfigs] = useState();
  const [isLoading, setIsLoading] = useState(true);
  const reloadConfigs = async () => {
    setIsLoading(true);
    const { configs } = await requester.getConfigs({});    
    setConfigs(configs);
    setIsLoading(false);
    return configs;
  };
  useEffect(() => {
    reloadConfigs();
  }, []);
  const getConfig = useCallback(
    (id) => {
      if (!id) {
        toast({
          type: "warning",
          message: "설정을 입력해주세요.",
        });
        return false;
      }
      return configs?.find((f) => f.id === id)?.config;
    },
    [configs]
  );

  return {
    configs,
    isLoading,
    getConfig,
  };
};

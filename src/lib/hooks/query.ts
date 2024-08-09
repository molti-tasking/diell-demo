import { getIsAdmin } from "@/actions/auth";
import { getOrganizations } from "@/actions/organization";
import { getUserEmail } from "@/actions/user";
import { useQuery } from "@tanstack/react-query";

/**
 * This query should only return the required data for admin users. All other users should only receive their own organization data.
 * @returns
 */
export const useOrganizations = () => {
  return useQuery({
    queryKey: ["organizations"],
    queryFn: () => getOrganizations(),
  });
};

export const useIsAdmin = () => {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: () => getIsAdmin(),
  });
};

export const useUserEmail = (userId: string) => {
  return useQuery({
    queryKey: ["user-email", userId],
    queryFn: () => getUserEmail(userId),
  });
};

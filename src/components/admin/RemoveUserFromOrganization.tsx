"use client";
import { removeUserFromOrganization } from "@/actions/organization-users";
import { Button } from "@/components/ui/button";

export const RemoveUserFromOrganization = ({
  userId,
  orgId,
}: {
  userId: string;
  orgId: string;
}) => {
  return (
    <Button
      variant={"link"}
      onClick={() => removeUserFromOrganization(userId, orgId)}
      className="text-red-500"
    >
      Revoke access
    </Button>
  );
};

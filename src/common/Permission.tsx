import React, { useEffect, useState } from 'react';
import { RESULTS, requestMultiple, check } from 'react-native-permissions';
import { permissionsType } from './PermissionCode';

interface PermissionProps {
  onPermissionGranted: () => void;
}

const Permission: React.FC<PermissionProps> = ({ onPermissionGranted }) => {
  const [isPermissionGranted, setIsPermissionGranted] =
    useState<boolean>(false);
  const permissionCheck = async () => {
    try {
      // 개별로 권한상태 확인
      const checkResults = {};
      for (const permission of permissionsType) {
        const result = await check(permission);
        checkResults[permission] = result;
      }
      console.log('check Permission', checkResults);

      if (
        // 권한 상태가 'granted'가 아닌 경우,
        Object.values(checkResults).some(result => result !== RESULTS.GRANTED)
      ) {
        const requestResults = await requestMultiple(permissionsType);

        if (
          // 권한 요청 후 처리
          Object.values(requestResults).every(
            result => result === RESULTS.GRANTED,
          )
        ) {
          setIsPermissionGranted(true);
        }
      } else {
        // 이미 모든 권한이 허용된 경우
        setIsPermissionGranted(true);
      }
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    permissionCheck();
  }, []);

  useEffect(() => {
    if (isPermissionGranted) {
      onPermissionGranted();
    }
  }, [isPermissionGranted, onPermissionGranted]);

  return null;
};

export default Permission;

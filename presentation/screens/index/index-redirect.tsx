import { Redirect } from 'expo-router';

export const IndexRedirect = (): React.JSX.Element => {
  return <Redirect href="/login" />;
};

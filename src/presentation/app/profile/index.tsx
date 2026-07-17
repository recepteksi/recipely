import { ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { useLayout } from '@presentation/base/responsive/use-layout';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, sizes } from '@presentation/base/theme';
import { useProfile } from '@presentation/app/profile/hooks/use-profile';
import { ProfileIdentity } from '@presentation/app/profile/body/profile-identity';
import { ProfileStats } from '@presentation/app/profile/body/profile-stats';
import { ProfileActions } from '@presentation/app/profile/body/profile-actions';
import { ProfileSettingsSections } from '@presentation/app/profile/body/profile-settings-sections';

export const ProfileScreen = (): React.JSX.Element => {
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const { isWebShell } = useLayout();
  const vm = useProfile();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <ScrollView
        contentContainerStyle={{
          paddingTop: isWebShell ? 0 : insets.top + spacing.sm,
          // Mobile: the root TabBar (hosted in _layout) sits below the page,
          // so only breathing room is needed; web keeps its former whitespace.
          paddingBottom: isWebShell ? sizes.tabBarHeight + spacing.xxl : spacing.xxl,
        }}
        showsVerticalScrollIndicator={false}
      >
        <ResponsiveContainer route="profile" gutter={false}>
          <ProfileIdentity
            displayName={vm.displayName}
            handle={vm.handle}
            bio={vm.bio}
            photoUri={vm.photoUri}
            isUploading={vm.isUploading}
            onPickAvatar={vm.onPickAvatar}
            onAddBio={vm.onEditProfile}
          />

          <ProfileStats stats={vm.stats} />

          <ProfileActions onEditProfile={vm.onEditProfile} />

          <View style={styles.settingsSections}>
            <ProfileSettingsSections />
          </View>
        </ResponsiveContainer>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  settingsSections: {
    marginTop: spacing.lg,
  },
});

export default ProfileScreen;

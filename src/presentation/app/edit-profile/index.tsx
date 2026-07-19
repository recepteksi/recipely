import { ScrollView, StyleSheet, View } from 'react-native';
import { KeyboardAvoider } from '@presentation/base/widgets/layout/keyboard-avoider';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ResponsiveContainer } from '@presentation/base/widgets/layout/responsive-container';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing } from '@presentation/base/theme';
import { useEditProfile } from '@presentation/app/edit-profile/hooks/use-edit-profile';
import { FeedbackSheet } from '@presentation/base/widgets/sheets/feedback-sheet';
import { t } from '@presentation/i18n';
import { EditProfileHeader } from '@presentation/app/edit-profile/body/edit-profile-header';
import { EditProfileAvatar } from '@presentation/app/edit-profile/body/edit-profile-avatar';
import { EditProfileForm } from '@presentation/app/edit-profile/body/edit-profile-form';

export const EditProfileScreen = (): React.JSX.Element => {
  const colors = useTheme().colors;
  const insets = useSafeAreaInsets();
  const vm = useEditProfile();

  return (
    <View style={[styles.root, { backgroundColor: colors.background }]}>
      <EditProfileHeader
        topInset={insets.top}
        saveEnabled={vm.saveEnabled}
        isSaving={vm.isSaving}
        onBack={vm.onBack}
        onSave={vm.onSave}
      />

      {/* No keyboardVerticalOffset: the avoider's own layout already sits below
          the header, so any extra offset is double-counted and shows up as a
          same-sized blank band above the keyboard. */}
      <KeyboardAvoider style={styles.flex}>
        <ScrollView
          contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xxl }}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <ResponsiveContainer route="forms">
            <EditProfileAvatar
              photoUri={vm.photoUri}
              displayName={vm.displayName}
              isUploading={vm.isUploading}
              onPick={vm.onPickAvatar}
            />
            <EditProfileForm
              displayName={vm.displayName}
              onChangeName={vm.onChangeName}
              showNameError={vm.showNameError}
              bio={vm.bio}
              onChangeBio={vm.onChangeBio}
              bioAtLimit={vm.bioAtLimit}
            />
          </ResponsiveContainer>
        </ScrollView>
      </KeyboardAvoider>

      <FeedbackSheet
        severity="danger"
        visible={vm.errorDialog !== null}
        title={t().errors.genericTitle}
        message={vm.errorDialog ?? ''}
        primaryLabel={t().common.ok}
        onPrimary={vm.onCloseErrorDialog}
        onClose={vm.onCloseErrorDialog}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1 },
  flex: { flex: 1 },
});

export default EditProfileScreen;

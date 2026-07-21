import { StyleSheet, TextInput, View } from 'react-native';
import { ThemedText } from '@presentation/base/widgets/text/themed-text';
import { useTheme } from '@presentation/base/theme/use-theme';
import { spacing, radii, fontSizes, sizes } from '@presentation/base/theme';
import { t } from '@presentation/i18n';
import { BIO_MAX, BIO_MIN_HEIGHT } from '@presentation/app/edit-profile/model/edit-profile-limits';
import { ValueConstants } from '@core/constants';
import { DISPLAY_NAME_MAX } from '@presentation/base/forms/display-name-limits';

export interface EditProfileFormProps {
  displayName: string;
  onChangeName: (value: string) => void;
  showNameError: boolean;
  bio: string;
  onChangeBio: (value: string) => void;
  bioAtLimit: boolean;
}

/** Display-name + bio card of the edit-profile screen. */
export const EditProfileForm = ({
  displayName,
  onChangeName,
  showNameError,
  bio,
  onChangeBio,
  bioAtLimit,
}: EditProfileFormProps): React.JSX.Element => {
  const colors = useTheme().colors;

  return (
    <View style={[styles.card, { backgroundColor: colors.surface, borderColor: colors.cardBorder }]}>
      <View style={styles.field}>
        <ThemedText variant="caption" muted style={styles.label}>
          {t().editProfile.displayName.toUpperCase()}
        </ThemedText>
        <TextInput
          value={displayName}
          onChangeText={onChangeName}
          placeholder={t().editProfile.displayNamePlaceholder}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            { color: colors.text, backgroundColor: colors.background, borderColor: colors.cardBorder },
          ]}
          autoCapitalize="words"
          returnKeyType="done"
          maxLength={DISPLAY_NAME_MAX}
        />
        {showNameError ? (
          <ThemedText variant="caption" style={[styles.errorLine, { color: colors.danger }]}>
            {t().editProfile.displayNameRequired}
          </ThemedText>
        ) : null}
      </View>

      <View style={styles.field}>
        <ThemedText variant="caption" muted style={styles.label}>
          {t().editProfile.bio.toUpperCase()}
        </ThemedText>
        <TextInput
          value={bio}
          onChangeText={onChangeBio}
          placeholder={t().editProfile.bioPlaceholder}
          placeholderTextColor={colors.textMuted}
          style={[
            styles.input,
            styles.textArea,
            { color: colors.text, backgroundColor: colors.background, borderColor: colors.cardBorder },
          ]}
          multiline
          numberOfLines={4}
          maxLength={BIO_MAX}
          textAlignVertical="top"
        />
        <ThemedText
          variant="caption"
          muted={!bioAtLimit}
          style={[styles.counter, bioAtLimit ? { color: colors.danger } : null]}
        >
          {bio.length}/{BIO_MAX}
        </ThemedText>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.lg,
    padding: spacing.lg,
    borderRadius: radii.xl,
    borderWidth: ValueConstants.one,
    gap: spacing.lg,
  },
  field: {
    gap: spacing.xs,
  },
  label: {
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  input: {
    height: sizes.inputHeightSm,
    borderRadius: radii.lg,
    borderWidth: sizes.inputBorderWidth,
    paddingHorizontal: spacing.md,
    fontSize: fontSizes.body,
  },
  textArea: {
    height: BIO_MIN_HEIGHT,
    paddingTop: spacing.md,
  },
  errorLine: {
    fontWeight: '600',
  },
  counter: {
    alignSelf: 'flex-end',
    fontSize: fontSizes.small,
  },
});

/**
 * EditProfileForm — display-name length cap.
 *
 * Regression: the name input had no `maxLength`, so a user could type past the
 * server's limit and only find out at save time, as a bare 400 dialog. The cap
 * must stay tied to DISPLAY_NAME_MAX, which mirrors the backend's
 * DisplayNameSchema.
 */

import { act } from 'react-test-renderer';
import { TextInput } from 'react-native';
import { renderComponent } from '@presentation/base/test-support/render-component';
import { EditProfileForm } from '@presentation/app/edit-profile/body/edit-profile-form';
import { DISPLAY_NAME_MAX } from '@presentation/base/forms/display-name-limits';
import { BIO_MAX } from '@presentation/app/edit-profile/model/edit-profile-limits';

describe('EditProfileForm — input length caps', () => {
  afterEach(async () => {
    await act(async () => {
      await Promise.resolve();
    });
  });

  it('caps the display-name input at DISPLAY_NAME_MAX and the bio at BIO_MAX', async () => {
    const tree = await renderComponent(
      <EditProfileForm
        displayName="Recep"
        onChangeName={jest.fn()}
        showNameError={false}
        bio=""
        onChangeBio={jest.fn()}
        bioAtLimit={false}
      />,
    );

    const maxLengths = tree.root
      .findAllByType(TextInput)
      .map((input) => input.props.maxLength);

    expect(maxLengths).toContain(DISPLAY_NAME_MAX);
    expect(maxLengths).toContain(BIO_MAX);
  });
});

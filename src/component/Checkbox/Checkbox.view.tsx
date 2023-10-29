import * as Checkbox from '@radix-ui/react-checkbox';
import classNames from 'classnames';
import { Check } from 'react-feather';
import styles from './Checkbox.module.css';

const CustomCheckbox = (props: Checkbox.CheckboxProps) => {
  return (
    <Checkbox.Root
      {...props}
      className={classNames(props.className, styles.checkbox)}
    >
      <div className={styles.check} />
      <Checkbox.Indicator className={styles.check}>
        <Check />
      </Checkbox.Indicator>
    </Checkbox.Root>
  );
};

export default CustomCheckbox;

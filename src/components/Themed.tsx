import { Text as DefaultText, View as DefaultView, TextInput as DefaultTextInput, TextProps, ViewProps, TouchableOpacity, TouchableOpacityProps, TextInputProps } from 'react-native';
import Colors from '../constants/Colors';
// import useColorScheme from '../hooks/useColorScheme';

//TODO: Remove, only keeping to prevent breaking behavior
export function useThemeColor(
  colorName: keyof typeof Colors.light & keyof typeof Colors.dark
) {
  // TODO: Remove; testing dark theme first
  // const theme = useColorScheme();
  const theme = "dark"
  return Colors[theme][colorName];
}
export function Text(props: TextProps) {
  const { style, ...otherProps } = props;
  return <DefaultText className={`text-body text-center`} style={style} {...otherProps} />;
}


export function SynqText(props: TextProps) {
  const { className = "", ...otherProps } = props;

  return <DefaultText className={`text-body text-center ${className}`} {...otherProps} />;
}

export function View(props: ViewProps) {
  const { className = "", ...otherProps } = props;

  return <DefaultView className={`bg-primary-background ${className}`} {...otherProps} />;
}

export function ScreenView(props: ViewProps) {
  const { className = "", ...otherProps } = props;

  return <DefaultView className={`text-body bg-primary-background px-6 py-12 flex-1 items-center ${className}`} {...otherProps} />;
}

interface ButtonProps extends TouchableOpacityProps {
  text: string;
}

export function SynqButton(props: ButtonProps) {
  const { className = "", ...otherProps } = props;

  return (
    <TouchableOpacity className={`rounded-md py-2 bg-accent w-64 ${className}`} {...otherProps}>
      <SynqText className='text-heading text-inverted-text text-center'>{props.text}</SynqText>
    </TouchableOpacity>
  )
}

export function TextInput(props: TextInputProps) {
  const { className = "", ...otherProps } = props;
  return (
    <DefaultTextInput
      className={`w-3/4 border-b-4 border-accent m-4 text-primary-text ${className}`}
      placeholderTextColor="#9ca3af"
      {...otherProps}
    />
  );
}

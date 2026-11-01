
import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

export default class StartupErrorBoundary extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      hasError: false,
      errorMessage: '',
      debugDetails: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      hasError: true,
      errorMessage: error instanceof Error ? error.message : String(error),
    };
  }

  componentDidCatch(error, info) {
    console.error('Uncaught app rendering error:', error, info.componentStack);
    this.setState({
      debugDetails: [
        error?.stack,
        info?.componentStack,
      ].filter(Boolean).join('\n\n'),
    });
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Something went wrong</Text>
        <Text style={styles.message}>
          Please close and reopen the app. If this keeps happening, contact support.
        </Text>
        <ScrollView style={styles.detailsContainer} contentContainerStyle={styles.detailsContent}>
          <Text selectable style={styles.details}>
            {this.state.errorMessage ? `Error: ${this.state.errorMessage}` : 'No error message was provided.'}
            {this.state.debugDetails ? `\n\n${this.state.debugDetails}` : ''}
          </Text>
        </ScrollView>
      </View>
    );
  }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F5EF',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#253D2C',
        marginBottom: 12,
        textAlign: 'center',
    },
    message: {
        fontSize: 16,
        color: '#333333',
        textAlign: 'center',
        marginBottom: 12,
    },
    details: {
        fontSize: 13,
        color: '#A33A32',
        marginBottom: 16,
        lineHeight: 18,
    },
    detailsContainer: {
        flexGrow: 0,
        maxHeight: 260,
        width: '100%',
        marginTop: 16,
    },
    detailsContent: {
        padding: 12,
        backgroundColor: '#F1E9DD',
        borderRadius: 8,
    },
    help: {
        fontSize: 14,
        color: '#555555',
        textAlign: 'center',
        lineHeight: 21,
    },
});

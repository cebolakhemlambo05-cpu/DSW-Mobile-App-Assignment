
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default class StartupErrorBoundary extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hasError: false,
            errorMessage: '',
        };
    }

    static getDerivedStateFromError(error) {
        return (
            <StartupErrorBoundary>
                <SafeAreaProvider>
                    <StatusBar style="light" />

                    <View style={styles.root}>
                        {/* Keep all your existing app screens here */}
                    </View>

                </SafeAreaProvider>
            </StartupErrorBoundary>
        );

        return this.props.children;
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
        textAlign: 'center',
        marginBottom: 16,
    },
    help: {
        fontSize: 14,
        color: '#555555',
        textAlign: 'center',
        lineHeight: 21,
    },
});

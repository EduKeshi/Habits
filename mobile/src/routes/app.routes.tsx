import { createNativeStackNavigator } from "@react-navigation/native-stack"

const { Navigator, Screen } = createNativeStackNavigator()

import { Home } from "../screens/Home"
import { New } from "../screens/New"
import { Habito } from "../screens/Habito"

export function AppRoutes() {
    return (
        <Navigator screenOptions={{ headerShown: false }}>
        <Screen
            name="home" // Nome da rota
            component={Home} // Qual componente será carregado
        />
        <Screen
            name="new"
            component={New}
        />
        <Screen
            name="habit"
            component={Habito}
        />

    </Navigator>
    )
    
}
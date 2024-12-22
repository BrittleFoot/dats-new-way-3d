import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from './ui/card'

export function Sidebar() {
    return (
        <Card className="m-4">
            <CardHeader>
                <CardTitle>Settings</CardTitle>
                <CardDescription>Configure your settings</CardDescription>
            </CardHeader>
            <CardContent>Content</CardContent>
        </Card>
    )
}

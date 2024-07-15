/*global chrome*/
/*global browser*/

import React, {useEffect, useState} from 'react';
import {Button, Checkbox, Flex, Form, Input, InputNumber, Switch, Tabs, Typography} from "antd";
import './style.css';

export const UserContext = React.createContext(null);

let sf424fsfs = chrome || browser;

function App() {
    let [settings, setSettings] = useState({position: ['fixed'], minHeight: 200, autoRemove: false});
    let [currentTabId, setCurrentTabId] = useState(null);
    let [total, setTotal] = useState(0);
    let [isStart, setIsStart] = useState(null);
    let [updateText, setUpdateText] = useState('Update');


    useEffect(() => {
        sf424fsfs.storage.local.get(['settings'], function (values) {
            if (values && values.settings) {
                setSettings(values.settings);
            }
        });
    }, [])


    if (currentTabId === null) {
        sf424fsfs.tabs.query({active: true}, function (tabs) {
            if (tabs && tabs.length && tabs[0] && tabs[0].id) {
                setCurrentTabId(tabs[0].id);
            }
        });
    }

    if (isStart === null) {
        sf424fsfs.storage.local.get(['isStart'], function (values) {
            if (values && values.isStart) {
                setIsStart(values.isStart);
            }
        });
    }

    useEffect(() => {
        sf424fsfs.storage.local.get(['popups'], function (values) {
            if (values && values.popups && values.popups[currentTabId]) {
                setTotal(values.popups[currentTabId]);
            }
        });
    }, [currentTabId]);

    useEffect(() => {
        setTimeout(() => {
            sf424fsfs.storage.local.get(['popups'], function (values) {
                if (values && values.popups && values.popups[currentTabId]) {
                    setTotal(values.popups[currentTabId]);
                }
            });
        }, 2000);
    }, [settings]);

    let onRemove = () => {
        sf424fsfs.runtime.sendMessage({
            action: "remove"
        });
        setTotal(0);
    };

    let onFinish = async (values) => {
        let {position, minHeight, autoRemove} = values;

        await sf424fsfs.storage.local.set({settings: {position, minHeight, autoRemove}});
        await sf424fsfs.runtime.sendMessage({action: 'update'});
        setUpdateText('Updated!');

        setTimeout(() => {
            setUpdateText('Update');
        }, 2000);

        setSettings({position, minHeight, autoRemove});
    };

    const items = [
        {
            key: '1',
            label: 'General',
            children: <>
                <Typography.Paragraph>We found {total} popup.</Typography.Paragraph>
                <Button type="primary" danger onClick={onRemove} disabled={total === 0}>
                    Remove all popup
                </Button>
            </>,
        },
        {
            key: '2',
            label: 'Settings',
            children: <>
                <Form
                    onFinish={onFinish}
                    initialValues={settings}
                >
                    <Form.Item
                        label="Position"
                        name="position"
                        rules={[
                            {
                                required: true,
                                message: 'Please choose a position!',
                            },
                        ]}
                    >
                        <Checkbox.Group options={['fixed', 'sticky', 'absolute']}/>
                    </Form.Item>

                    <Form.Item
                        label="Min Height(px)"
                        name="minHeight"
                        rules={[
                            {
                                required: true,
                                message: 'Please fill min height field!',
                            },
                        ]}
                    >
                        <InputNumber min={0}/>
                    </Form.Item>

                    <Form.Item
                        label="Auto remove popup"
                        name="autoRemove"
                    >
                        <Switch/>
                    </Form.Item>

                    <Button type="primary" htmlType="submit">
                        {updateText}
                    </Button>
                </Form>
            </>,
        }
    ];

    return (
        <div style={{minWidth: '250px', margin: '0px 15px 15px 15px'}}>
            <UserContext.Provider
                value={{
                    settings, setSettings,
                }}>
                <Tabs defaultActiveKey="1" items={items}/>
            </UserContext.Provider>
        </div>
    );
}

export default App;
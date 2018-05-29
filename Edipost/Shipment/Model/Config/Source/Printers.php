<?php

namespace Edipost\Shipment\Model\Config\Source;

use Magento\Framework\Option\ArrayInterface;

class Printers implements ArrayInterface
{
    public function toOptionArray()
    {
        return [
            ['value' => '0', 'label' => __('No available printers')],
        ];
    }
}
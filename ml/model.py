import torch
from torch import nn
from torch.nn import functional as F


def block(a, b):
    # GroupNorm is stable at batch size one on constrained local hardware.
    return nn.Sequential(nn.Conv2d(a, b, 3, padding=1), nn.GroupNorm(1, b), nn.ReLU(),
                         nn.Conv2d(b, b, 3, padding=1), nn.GroupNorm(1, b), nn.ReLU())


class UNet(nn.Module):
    def __init__(self, channels=3, width=8):
        super().__init__()
        self.e1, self.e2 = block(channels, width), block(width, width * 2)
        self.bridge = block(width * 2, width * 4)
        self.d2, self.d1 = block(width * 6, width * 2), block(width * 3, width)
        self.head = nn.Conv2d(width, 1, 1)
        for m in self.modules():
            if isinstance(m, nn.Conv2d):
                nn.init.kaiming_normal_(m.weight)
                nn.init.zeros_(m.bias)

    def forward(self, x):
        a = self.e1(x)
        b = self.e2(F.max_pool2d(a, 2))
        c = self.bridge(F.max_pool2d(b, 2))
        d = self.d2(torch.cat([F.interpolate(c, size=b.shape[-2:], mode='bilinear', align_corners=False), b], 1))
        return self.head(self.d1(torch.cat([F.interpolate(d, size=a.shape[-2:], mode='bilinear', align_corners=False), a], 1)))
